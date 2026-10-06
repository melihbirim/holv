#!/usr/bin/env bash
# The one runnable check. Exit code is the verdict; read the FAIL lines. Conformance lives in tests/*.holv.
set -u
cd "$(dirname "$0")"
H="node holvc.mjs"
fail=0
ok()  { echo "ok   $1"; }
bad() { echo "FAIL $1"; fail=1; }

node tests/run.mjs | tail -1 | grep -q '"failed":0' && ok "tests/*.holv conformance ($(ls tests/*.holv | wc -l | tr -d ' ') files)" || { bad "conformance; run: node tests/run.mjs"; node tests/run.mjs | grep '"pass":false'; }

HOLV_NOW=1700000000 $H run examples/rank.holv 1000 > /tmp/holv_a.txt 2>/dev/null; node bench/rank.js 1000 > /tmp/holv_b.txt
cmp -s /tmp/holv_a.txt /tmp/holv_b.txt && ok "rank.holv matches the JS reference at n=1000" || bad "rank.holv differs from the JS reference"

$H run examples/rank.holv 3 --simulate 2>/dev/null | grep -q '"effect":"Out.print"' && ok "simulate logs effects, prints nothing" || bad "simulate"

[ -d caps/slugify/node_modules ] || pnpm install --silent --frozen-lockfile --dir caps/slugify || { bad "pnpm install caps/slugify"; exit 1; }
[ "$($H run examples/npm/slug.holv "Hello World, from holv!" --caps slugify 2>/dev/null)" = "/posts/hello-world-from-holv" ] && ok "npm package behind a reviewed cap via --caps slugify" || bad "npm cap"

# every file that is expected to compile is committed in canonical form
fmtfail=0
for f in examples/*.holv examples/npm/*.holv tests/ok_*.holv tests/run_*.holv tests/hole_*.holv tests/examples_*.holv tests/fail_*.holv; do
  $H fmt "$f" --check >/dev/null 2>&1 || { fmtfail=1; echo "     not canonical: $f"; }
done
[ $fmtfail -eq 0 ] && ok "fmt --check: committed files are canonical" || bad "fmt --check; run: ./holvc.mjs fmt <file> --write"
printf 'holv 0\nfn f(  ) -> Int {   1 }\n' > /tmp/holv_ugly.holv
$H fmt /tmp/holv_ugly.holv --check 2>&1 | grep -q '"code":"F001"' && ok "fmt --check rejects a non-canonical file with F001" || bad "fmt --check should fail with F001"

exit $fail
