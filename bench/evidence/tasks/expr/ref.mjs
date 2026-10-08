const src = process.argv[2] ?? "";
const toks = src.match(/\d+|[+\-*/()]|\S/g) ?? [];
let pos = 0; const bad = () => { throw new Error("bad"); };
const peek = () => toks[pos];
function primary() { const t = toks[pos++]; if (t === undefined) bad(); if (t === "-") return -primary(); if (t === "(") { const v = expr(); if (toks[pos++] !== ")") bad(); return v; } if (/^\d+$/.test(t)) return Number(t); bad(); }
function term() { let v = primary(); while (peek() === "*" || peek() === "/") { const op = toks[pos++]; const r = primary(); if (op === "*") v *= r; else { if (r === 0) bad(); v = Math.trunc(v / r); } } return v; }
function expr() { let v = term(); while (peek() === "+" || peek() === "-") { const op = toks[pos++]; const r = term(); v = op === "+" ? v + r : v - r; } return v; }
try { if (/[^\d+\-*/() ]/.test(src)) bad(); const v = expr(); if (pos !== toks.length) bad(); console.log(v); } catch { console.log("error"); }
