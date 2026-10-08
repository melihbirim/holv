const [a, b, m] = process.argv.slice(2).map(BigInt);
console.log(String((a * b) % m));
