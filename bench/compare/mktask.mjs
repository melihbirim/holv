#!/usr/bin/env node
// Builds bench/compare/tasks/<name>/{task.md,task.json}: the evidence task plus extra hidden cases whose expected output is
// computed by the task's JS reference (ref.mjs) and cross-checked against ref.holv. Usage: mktask.mjs <name> <extra-args.json>
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const [name, extraFile] = process.argv.slice(2);
const src = path.join("bench/evidence/tasks", name), out = path.join("bench/compare/tasks", name);
const t = JSON.parse(fs.readFileSync(path.join(src, "task.json"), "utf8"));
const extra = JSON.parse(fs.readFileSync(extraFile, "utf8"));
const run = (c, a) => spawnSync(c[0], [...c.slice(1), ...a], { encoding: "utf8" }).stdout.replace(/\s+$/, "");
let bad = 0;
for (const a of extra) {
  const js = run(["node", path.join(src, "ref.mjs")], [a]), hv = run(["node", "holvc.mjs", "run", path.join(src, "ref.holv")], [a]);
  if (js !== hv) { bad++; console.error(`ref mismatch on ${JSON.stringify(a)}:\n js: ${js}\n holv: ${hv}`); continue; }
  t.hidden.push({ args: [a], stdout: js });
}
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "task.json"), JSON.stringify(t, null, 1));
fs.copyFileSync(path.join(src, "task.md"), path.join(out, "task.md"));
console.log(`${name}: ${t.hidden.length} hidden cases, ${bad} dropped`);
