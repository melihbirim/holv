let [a, b] = process.argv.slice(2).map(Number);
while (b !== 0) [a, b] = [b, a % b];
console.log(a);
