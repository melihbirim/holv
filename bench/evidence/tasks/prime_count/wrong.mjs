const n = Number(process.argv[2]); let c = 0;
for (let i = 2; i <= n; i++) { let p = true; for (let j = 2; j * j <= i; j++) if (i % j === 0) p = false; if (p) c++; }
console.log(c);
