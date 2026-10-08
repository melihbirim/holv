const n = Number(process.argv[2]); let a = 1, b = 1;
for (let i = 1; i < n; i++) [a, b] = [b, a + b];
console.log(a);
