const y = Number(process.argv[2]);
console.log(y % 400 === 0 || (y % 4 === 0 && y % 100 !== 0) ? "leap" : "common");
