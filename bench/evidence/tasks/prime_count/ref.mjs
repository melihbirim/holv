const n = Number(process.argv[2]);
const s = new Array(Math.max(n, 0)).fill(true); let c = 0;
for (let i = 2; i < n; i++) { if (s[i]) { c++; for (let j = i * i; j < n; j += i) s[j] = false; } }
console.log(c);
