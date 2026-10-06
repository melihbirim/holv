#!/usr/bin/env bash
# The one runnable check. Fails loudly if any pipeline stage regresses. Exit code is the verdict; read the FAIL lines.
set -u
cd "$(dirname "$0")"
H="node holvc.mjs"
fail=0
ok()   { echo "ok   $1"; }
bad()  { echo "FAIL $1"; fail=1; }
expect_err() { # file code
  if $H check "$1" 2>&1 >/dev/null | grep -q "\"code\":\"$2\""; then ok "$1 rejects with $2"; else bad "$1 should fail with $2"; fi
}

$H check examples/rank.holv >/dev/null 2>&1 && ok "check rank.holv" || bad "check rank.holv"
$H test examples/rank.holv 2>/dev/null | grep -q '"pass":true' && ok "example score == 1.25" || bad "example"
expect_err examples/bad.holv E021   # cap param without effects
expect_err examples/bad.holv E022   # calling effectful fn without effects
expect_err examples/bad.holv E056   # missing struct field
expect_err examples/bad.holv E032   # Int /
expect_err examples/bad.holv E031   # Int + Float
expect_err examples/bad.holv E054   # assign to let

$H run examples/holed.holv 5 >/dev/null 2>/tmp/holv_hole.json; [ $? -eq 3 ] && grep -q '"hole":"checksum' /tmp/holv_hole.json && ok "hole stops with scope, exit 3" || bad "hole"

$H run examples/rank.holv 1000 > /tmp/holv_a.txt 2>/dev/null; node bench/rank.js 1000 > /tmp/holv_b.txt
cmp -s /tmp/holv_a.txt /tmp/holv_b.txt && ok "output matches JS reference at n=1000" || bad "output differs from JS reference"

$H run examples/rank.holv 3 --simulate 2>/dev/null | grep -q '"effect":"Out.print"' && ok "simulate logs effects, prints nothing" || bad "simulate"

[ -d caps/slugify/node_modules ] || pnpm install --silent --frozen-lockfile --dir caps/slugify || { bad "pnpm install caps/slugify"; exit 1; }
[ "$($H run examples/npm/slug.holv "Hello World, from holv!" --caps slugify 2>/dev/null)" = "/posts/hello-world-from-holv" ] && ok "npm package behind a reviewed cap via --caps slugify" || bad "npm cap"

$H fmt examples/rank.holv > /tmp/holv_f1.holv && $H fmt /tmp/holv_f1.holv > /tmp/holv_f2.holv && cmp -s /tmp/holv_f1.holv /tmp/holv_f2.holv && ok "fmt is idempotent" || bad "fmt not idempotent"
$H check /tmp/holv_f1.holv >/dev/null 2>&1 && ok "fmt output still typechecks" || bad "fmt output broken"
grep -q -- "-- descending score" /tmp/holv_f1.holv && ok "fmt keeps comments" || bad "fmt lost comments"

exit $fail
