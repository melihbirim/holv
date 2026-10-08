const log = process.argv[2] ?? "";
const bal = new Map(); const order = []; let rejected = 0;
const amt = (s) => (/^\d+$/.test(s) && Number(s) > 0 ? Number(s) : null);
const ensure = (n) => { if (!bal.has(n)) { bal.set(n, 0); order.push(n); } };
for (const rec of log.split(";").filter((r) => r !== "")) {
  const f = rec.split(":");
  if (f[0] === "deposit" && f.length === 3 && amt(f[2]) !== null) { ensure(f[1]); bal.set(f[1], bal.get(f[1]) + amt(f[2])); }
  else if (f[0] === "withdraw" && f.length === 3 && amt(f[2]) !== null) { if (bal.has(f[1]) && bal.get(f[1]) >= amt(f[2])) bal.set(f[1], bal.get(f[1]) - amt(f[2])); else rejected++; }
  else if (f[0] === "transfer" && f.length === 4 && amt(f[3]) !== null) {
    const a = amt(f[3]);
    if (bal.has(f[1]) && bal.get(f[1]) >= a && f[1] !== f[2]) { bal.set(f[1], bal.get(f[1]) - a); ensure(f[2]); bal.set(f[2], bal.get(f[2]) + a); } else rejected++;
  } else rejected++;
}
for (const n of order) console.log(`${n} ${bal.get(n)}`);
console.log(`rejected ${rejected}`);
