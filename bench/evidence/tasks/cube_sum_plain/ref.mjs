const n = Number(process.argv[2]); const M = 1000000007n; let acc = 0n;
for (let i = 1n; i <= BigInt(n); i++) acc = (acc + i * i * i) % M;
console.log(String(acc));
