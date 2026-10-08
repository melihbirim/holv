const cmds = process.argv[2] ?? "";
const stock = new Map(), price = new Map(); let rejected = 0;
const digits = (s) => /^\d+$/.test(s);
for (const c of cmds.split(";").filter((x) => x !== "")) {
  const f = c.split(":");
  if (f[0] === "add" && f.length === 4 && digits(f[2]) && digits(f[3])) { stock.set(f[1], (stock.get(f[1]) ?? 0) + Number(f[2])); price.set(f[1], Number(f[3])); }
  else if (f[0] === "remove" && f.length === 3 && digits(f[2])) { if (stock.has(f[1]) && stock.get(f[1]) >= Number(f[2])) stock.set(f[1], stock.get(f[1]) - Number(f[2])); else rejected++; }
  else if (f[0] === "price" && f.length === 3 && digits(f[2])) { if (stock.has(f[1])) price.set(f[1], Number(f[2])); else rejected++; }
  else if (f[0] === "report" && f.length === 1) {
    let total = 0n;
    for (const sku of [...stock.keys()].sort()) { const v = BigInt(stock.get(sku)) * BigInt(price.get(sku)); total += v; console.log(`${sku} ${stock.get(sku)} ${v}`); }
    console.log(`total ${total}`);
  } else rejected++;
}
console.log(`rejected ${rejected}`);
