const input: string = process.argv[2] ?? "";
const acc = new Map<string, bigint>();
let rejected = 0;
const isAmt = (s: string): boolean => /^[0-9]+$/.test(s) && BigInt(s) > 0n;
for (const rec of input.split(";")) {
  if (rec === "") continue;
  const f = rec.split(":");
  const c = f[0];
  let ok = false;
  if (c === "deposit" && f.length === 3 && isAmt(f[2])) {
    acc.set(f[1], (acc.get(f[1]) ?? 0n) + BigInt(f[2]));
    ok = true;
  } else if (c === "withdraw" && f.length === 3 && isAmt(f[2])) {
    const b = acc.get(f[1]);
    const a = BigInt(f[2]);
    if (b !== undefined && b >= a) { acc.set(f[1], b - a); ok = true; }
  } else if (c === "transfer" && f.length === 4 && isAmt(f[3])) {
    const b = acc.get(f[1]);
    const a = BigInt(f[3]);
    if (b !== undefined && b >= a && f[1] !== f[2]) {
      acc.set(f[1], b - a);
      acc.set(f[2], (acc.get(f[2]) ?? 0n) + a);
      ok = true;
    }
  }
  if (!ok) rejected++;
}
for (const [n, b] of acc) console.log(`${n} ${b}`);
console.log(`rejected ${rejected}`);
