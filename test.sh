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

$H contract examples/rank.holv > /tmp/holv_c1.json && $H contract examples/rank.holv > /tmp/holv_c2.json && cmp -s /tmp/holv_c1.json /tmp/holv_c2.json \
  && node -e 'const c=JSON.parse(require("fs").readFileSync("/tmp/holv_c1.json","utf8")); if(c.main.args[0].name!=="n"||c.main.caps.length!==3||c.hash.length!==64||!c.fns.score.examples[0].includes("1.25")) process.exit(1)' \
  && ok "contract: generated from signatures, stable hash" || bad "contract"
[ "$(node --experimental-strip-types --no-warnings examples/.holv-out/rank.run.ts --contract | node -e 'process.stdin.on("data",d=>process.stdout.write(JSON.parse(d).program))')" = "rank" ] && ok "built program answers --contract" || bad "--contract"

exit $fail
