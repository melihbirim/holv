let n = Number(process.argv[2]), c = 0;
while (n !== 1) { n = n % 2 === 0 ? n / 2 : 3 * n + 1; c++; }
console.log(c);
