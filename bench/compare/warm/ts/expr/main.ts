const s = process.argv[2] ?? "";
let i = 0;
function ws() { while (s[i] === " ") i++; }
function fail(): never { throw new Error("e"); }
function primary(): bigint {
  ws();
  const c = s[i];
  if (c === "-") { i++; return -primary(); }
  if (c === "(") {
    i++;
    const v = expr();
    ws();
    if (s[i] !== ")") fail();
    i++;
    return v;
  }
  if (c !== undefined && c >= "0" && c <= "9") {
    const st = i;
    while (s[i] !== undefined && s[i] >= "0" && s[i] <= "9") i++;
    return BigInt(s.slice(st, i));
  }
  return fail();
}
function term(): bigint {
  let v = primary();
  for (;;) {
    ws();
    const c = s[i];
    if (c === "*") { i++; v = v * primary(); }
    else if (c === "/") {
      i++;
      const d = primary();
      if (d === 0n) fail();
      v = v / d;
    } else return v;
  }
}
function expr(): bigint {
  let v = term();
  for (;;) {
    ws();
    const c = s[i];
    if (c === "+") { i++; v = v + term(); }
    else if (c === "-") { i++; v = v - term(); }
    else return v;
  }
}
try {
  const v = expr();
  ws();
  if (i !== s.length) fail();
  console.log(String(v));
} catch {
  console.log("error");
}
