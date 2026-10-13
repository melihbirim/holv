type Accounts = Map<string, bigint>;

// AMOUNT must be a positive integer written in digits.
function parseAmount(s: string): bigint | null {
  if (!/^[0-9]+$/.test(s)) return null;
  const v = BigInt(s);
  if (v <= 0n) return null;
  return v;
}

function run(input: string): string[] {
  // Map keeps insertion order, and set() on an existing key does not move it,
  // so iteration yields accounts in creation order.
  const accounts: Accounts = new Map();
  let rejected = 0;

  for (const rec of input.split(";")) {
    if (rec === "") continue;
    const f = rec.split(":");
    const cmd = f[0];
    let ok = false;

    if (cmd === "deposit" && f.length === 3) {
      const amt = parseAmount(f[2]);
      if (amt !== null) {
        accounts.set(f[1], (accounts.get(f[1]) ?? 0n) + amt);
        ok = true;
      }
    } else if (cmd === "withdraw" && f.length === 3) {
      const amt = parseAmount(f[2]);
      const bal = accounts.get(f[1]);
      if (amt !== null && bal !== undefined && bal >= amt) {
        accounts.set(f[1], bal - amt);
        ok = true;
      }
    } else if (cmd === "transfer" && f.length === 4) {
      const from = f[1];
      const to = f[2];
      const amt = parseAmount(f[3]);
      const bal = accounts.get(from);
      if (amt !== null && bal !== undefined && bal >= amt && from !== to) {
        accounts.set(from, bal - amt);
        accounts.set(to, (accounts.get(to) ?? 0n) + amt);
        ok = true;
      }
    }

    if (!ok) rejected++;
  }

  const lines: string[] = [];
  for (const [name, bal] of accounts) {
    lines.push(`${name} ${bal.toString()}`);
  }
  lines.push(`rejected ${rejected}`);
  return lines;
}

const input = process.argv[2] ?? "";
for (const line of run(input)) {
  console.log(line);
}
