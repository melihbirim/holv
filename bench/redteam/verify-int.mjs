#!/usr/bin/env node
// Round 3 verifier: for every attempts-int/*.holv, run it for each `-- args:` line (header comments `-- env: K=V`,
// `-- caps: file.ts` apply to every run), and compare stdout with reference-int.py, the exact arithmetic in Python.
//   REJECTED   the compiler refused the program
//   MATCH      output equals the reference (or the reference stops and holv stops with exit 4 having printed only lines the reference prints first)
//   VIOLATION  holv printed a line the exact arithmetic does not, or finished (exit 0) where the exact arithmetic stops
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const HOLVC = process.env.HOLVC ?? path.join(HERE, "..", "..", "holvc.mjs");
const dir = path.join(HERE, "attempts-int");
let bad = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".holv")).sort()) {
  const file = path.join(dir, f), name = f.replace(/\.holv$/, "");
  const src = fs.readFileSync(file, "utf8");
  const hdr = (k) => [...src.matchAll(new RegExp(`^-- ${k}: (.*)$`, "gm"))].map((m) => m[1].trim());
  const env = { ...process.env, HOLV_NOW: "1700000000", HOLV_SEED: "42" };
  for (const e of hdr("env")) { const [k, ...v] = e.split("="); env[k] = v.join("="); }
  const caps = hdr("caps")[0];
  const chk = spawnSync(process.execPath, [HOLVC, "check", file], { encoding: "utf8", env });
  if (chk.status !== 0) { console.log(`REJECTED  ${f}  ${[...new Set(chk.stderr.match(/"code":"E\d+"/g) ?? [])].map((c) => c.slice(8, -1)).join(" ")}`); continue; }
  const runs = hdr("args").length ? hdr("args") : [""];
  for (const a of runs) {
    const args = a.split(/\s+/).filter(Boolean);
    const r = spawnSync(process.execPath, [HOLVC, "run", file, ...args, ...(caps ? ["--caps", path.join(dir, caps)] : [])], { encoding: "utf8", env });
    const ref = JSON.parse(spawnSync("python3", ["-I", path.join(HERE, "reference-int.py"), name, ...args], { encoding: "utf8" }).stdout);
    const got = r.stdout.split("\n").filter((l) => l.length);
    const tag = `${f} [${a}]`;
    let why = "";
    if (ref.stop) {
      if (r.status === 0) why = `exact arithmetic stops, holv finished printing ${JSON.stringify(got)}`;
      else if (got.length > ref.out.length || got.some((l, i) => l !== ref.out[i])) why = `holv printed ${JSON.stringify(got)} before stopping, exact: ${JSON.stringify(ref.out)}`;
      else if (r.status !== 4) why = `holv exit ${r.status}, expected a runtime stop (4)`;
    } else if (r.status !== 0 || got.join("\n") !== ref.out.join("\n")) why = `holv printed ${JSON.stringify(got)} exit ${r.status}, exact: ${JSON.stringify(ref.out)}`;
    if (why) { bad = 1; console.log(`VIOLATION ${tag}  ${why}`); }
    else console.log(`MATCH     ${tag}  ${ref.stop ? "stopped (exit 4) as the exact arithmetic does" : `${got.length} lines equal the reference`}`);
  }
}
process.exit(bad);
