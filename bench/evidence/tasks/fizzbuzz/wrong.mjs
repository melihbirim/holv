const n = Number(process.argv[2]);
for (let i = 1; i <= n; i++) console.log(i % 3 === 0 ? "Fizz" : i % 5 === 0 ? "Buzz" : String(i));
