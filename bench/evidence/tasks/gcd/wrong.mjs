let [a, b] = process.argv.slice(2).map(Number); let g = 1;
for (let i = 1; i <= Math.min(a, b); i++) if (a % i === 0 && b % i === 0) g = i;
console.log(g);
