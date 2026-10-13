const input = process.argv[2] ?? "";
const inv = new Map<string, { q: bigint; p: bigint }>();
let rejected = 0;
function num(s: string): bigint | null {
  return /^[0-9]+$/.test(s) ? BigInt(s) : null;
}
for (const cmd of input.split(";")) {
  if (cmd === "") continue;
  const f = cmd.split(":");
  let ok = false;
  if (f[0] === "add" && f.length === 4) {
    const q = num(f[2]), p = num(f[3]);
    if (q !== null && p !== null) {
      const e = inv.get(f[1]);
      inv.set(f[1], { q: (e?.q ?? 0n) + q, p });
      ok = true;
    }
  } else if (f[0] === "remove" && f.length === 3) {
    const q = num(f[2]);
    const e = inv.get(f[1]);
    if (q !== null && e !== undefined && e.q >= q) { e.q -= q; ok = true; }
  } else if (f[0] === "price" && f.length === 3) {
    const p = num(f[2]);
    const e = inv.get(f[1]);
    if (p !== null && e !== undefined) { e.p = p; ok = true; }
  } else if (f[0] === "report" && f.length === 1) {
    ok = true;
    const keys = [...inv.keys()].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    let t = 0n;
    for (const k of keys) {
      const e = inv.get(k)!;
      const v = e.q * e.p;
      t += v;
      console.log(`${k} ${e.q} ${v}`);
    }
    console.log(`total ${t}`);
  }
  if (!ok) rejected++;
}
console.log(`rejected ${rejected}`);
