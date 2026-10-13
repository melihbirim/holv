const input: string = process.argv[2] ?? "";
const balances = new Map<string, bigint>();
let rejected = 0;

function parseAmount(s: string): bigint | null {
  if (!/^[0-9]+$/.test(s)) return null;
  const v = BigInt(s);
  return v > 0n ? v : null;
}

for (const rec of input.split(";")) {
  if (rec === "") continue;
  const f = rec.split(":");
  let ok = false;
  if (f[0] === "deposit" && f.length === 3) {
    const a = parseAmount(f[2]);
    if (a !== null) {
      balances.set(f[1], (balances.get(f[1]) ?? 0n) + a);
      ok = true;
    }
  } else if (f[0] === "withdraw" && f.length === 3) {
    const a = parseAmount(f[2]);
    const b = balances.get(f[1]);
    if (a !== null && b !== undefined && b >= a) {
      balances.set(f[1], b - a);
      ok = true;
    }
  } else if (f[0] === "transfer" && f.length === 4) {
    const a = parseAmount(f[3]);
    const from = f[1], to = f[2];
    const b = balances.get(from);
    if (a !== null && b !== undefined && b >= a && from !== to) {
      balances.set(from, b - a);
      balances.set(to, (balances.get(to) ?? 0n) + a);
      ok = true;
    }
  }
  if (!ok) rejected++;
}

for (const [name, bal] of balances) console.log(`${name} ${bal.toString()}`);
console.log(`rejected ${rejected}`);
