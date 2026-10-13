const input = process.argv[2] ?? "";
const acc = new Map<string, bigint>();
let rejected = 0;
function amt(s: string): bigint | null {
  if (!/^[0-9]+$/.test(s)) return null;
  const v = BigInt(s);
  return v > 0n ? v : null;
}
for (const rec of input.split(";")) {
  if (rec === "") continue;
  const f = rec.split(":");
  let ok = false;
  if (f[0] === "deposit" && f.length === 3) {
    const a = amt(f[2]);
    if (a !== null) { acc.set(f[1], (acc.get(f[1]) ?? 0n) + a); ok = true; }
  } else if (f[0] === "withdraw" && f.length === 3) {
    const a = amt(f[2]);
    const b = acc.get(f[1]);
    if (a !== null && b !== undefined && b >= a) { acc.set(f[1], b - a); ok = true; }
  } else if (f[0] === "transfer" && f.length === 4) {
    const a = amt(f[3]);
    const b = acc.get(f[1]);
    if (a !== null && b !== undefined && b >= a && f[1] !== f[2]) {
      acc.set(f[1], b - a);
      acc.set(f[2], (acc.get(f[2]) ?? 0n) + a);
      ok = true;
    }
  }
  if (!ok) rejected++;
}
for (const [n, b] of acc) console.log(`${n} ${b}`);
console.log(`rejected ${rejected}`);
