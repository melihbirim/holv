const n = Number(process.argv[2]); const a = Array.from({ length: n }, (_, i) => (i * 7) % 13);
let best = 0; for (let i = 0; i < n - 1; i++) best = Math.max(best, Math.abs(a[i] - a[i + 1]));
console.log(best);
