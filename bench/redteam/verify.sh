#!/usr/bin/env bash
# Every attempt is run through the compiler. Three verdicts:
#   REJECTED   the compiler refused it (codes listed)
#   DATA-ONLY  it compiled, but every call to a Clock method sits inside a fn that declares `effects Clock`;
#              a pure fn only received a number derived from time, which the design allows (see README)
#   VIOLATION  it compiled and a fn without `effects Clock` contains a Clock method call: a soundness bug
cd "$(dirname "$0")"
bad=0
for f in attempts/*.holv; do
  out=$(node ../../holvc.mjs check "$f" 2>&1 >/dev/null)
  if [ $? -ne 0 ]; then echo "REJECTED  $f  $(echo "$out" | grep -o '"code":"E[0-9]*"' | sort -u | tr -d '"' | sed 's/code://' | tr '\n' ' ')"; continue; fi
  # split the source into fns and look for a Clock call inside a fn whose header block lacks `effects ...Clock`
  v=$(awk '
    /^fn /{ if (infn && hascall && !haseff) viol=1; infn=1; hascall=0; haseff=0 }
    infn && /^  effects .*Clock/ { haseff=1 }
    infn && /\.now\(/ { hascall=1 }
    END { if (infn && hascall && !haseff) viol=1; print viol+0 }' "$f")
  if [ "$v" = "1" ]; then echo "VIOLATION $f"; bad=1; else echo "DATA-ONLY $f"; fi
done
exit $bad
