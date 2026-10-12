#!/usr/bin/env node
// Round 2 verifier: for every attempts-simulate/*.holv, run the real and the simulated program with the clock and rng
// pinned, and compare. HOLVC selects the compiler under test (default ../../holvc.mjs). Verdicts:
//   REJECTED   the compiler refused the program (codes listed); not a valid attempt
//   MATCH      the plan's Out.print sequence equals the real run's stdout, exit codes agree, nothing but plan lines on stdout
//   VIOLATION  anything else: a leaked line under --simulate, a print the plan omits or invents, a different exit code
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const HOLVC = process.env.HOLVC ?? path.join(HERE, "..", "..", "holvc.mjs");
const dir = path.join(HERE, "attempts-simulate");
const env = { ...process.env, HOLV_NOW: "1700000000", HOLV_SEED: "42" };
const run = (file, extra) => spawnSync(process.execPath, [HOLVC, "run", file, ...extra], { encoding: "utf8", env });
let bad = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".holv")).sort()) {
  const file = path.join(dir, f);
  const src = fs.readFileSync(file, "utf8");
  const args = (src.match(/^-- args: (.*)$/m)?.[1] ?? "").trim().split(/\s+/).filter(Boolean);
  const chk = spawnSync(process.execPath, [HOLVC, "check", file], { encoding: "utf8", env });
  if (chk.status !== 0) { console.log(`REJECTED  ${f}  ${[...new Set(chk.stderr.match(/"code":"E\d+"/g) ?? [])].map((c) => c.slice(8, -1)).join(" ")}`); continue; }
  const real = run(file, args), sim = run(file, [...args, "--simulate"]);
  const why = [];
  const lines = sim.stdout.split("\n").filter((l) => l.length);
  const plan = [];
  for (const l of lines) { try { const e = JSON.parse(l); if (typeof e.effect !== "string") throw 0; plan.push(e); } catch { why.push(`leaked stdout line under --simulate: ${JSON.stringify(l.slice(0, 80))}`); } }
  const printed = plan.filter((e) => e.effect === "Out.print").map((e) => `${e.args[0]}\n`).join("");
  if (printed !== real.stdout) why.push(`plan prints ${JSON.stringify(printed.slice(0, 120))}, real run printed ${JSON.stringify(real.stdout.slice(0, 120))}`);
  if (real.status !== sim.status) why.push(`exit codes differ: real ${real.status}, simulate ${sim.status}`);
  if (real.status === 1 || sim.status === 1) why.push(`build failed`);
  if (why.length) { bad = 1; console.log(`VIOLATION ${f}  ${why.join("; ")}`); } else console.log(`MATCH     ${f}  ${plan.length} effects, exit ${real.status}`);
}
process.exit(bad);
