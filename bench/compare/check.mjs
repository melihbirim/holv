#!/usr/bin/env node
// Usage: check.mjs <task> <lang> <file>   langs: holv ts py rs zig js. Builds the file, runs visible + hidden cases from
// bench/evidence/tasks/<task>/task.json, prints one JSON line {visible, hidden:[bool], pass, buildError?}.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..", "..");
const [task, lang, file0] = process.argv.slice(2);
const file = path.resolve(file0);
const t = JSON.parse(fs.readFileSync(path.join(ROOT, "bench/evidence/tasks", task, "task.json"), "utf8"));
const env = { ...process.env, HOLV_NOW: "1700000000", HOLV_SEED: "42" };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cmp-"));
const bin = path.join(tmp, "bin");
let build = null, mk;
const sh = (c, a, o = {}) => spawnSync(c, a, { encoding: "utf8", env, timeout: 120000, ...o });
if (lang === "rs") build = sh("rustc", ["-O", "-o", bin, file]);
if (lang === "zig") build = sh("python3.13", ["-m", "ziglang", "build-exe", file, `-femit-bin=${bin}`, "-O", "ReleaseFast"], { cwd: tmp });
if (build && build.status !== 0) { console.log(JSON.stringify({ pass: false, buildError: (build.stderr || "").slice(0, 300) })); process.exit(1); }
const cmd = (args) => ({
  holv: ["node", [path.join(ROOT, "holvc.mjs"), "run", file, ...args]],
  ts: ["node", ["--experimental-strip-types", "--no-warnings", file, ...args]],
  js: ["node", [file, ...args]],
  py: ["python3", [file, ...args]],
  rs: [bin, args], zig: [bin, args],
}[lang]);
const run = (c) => { const [p, a] = cmd(c.args); const r = sh(p, a); return r.stdout.replace(/\s+$/, "") === c.stdout.replace(/\s+$/, ""); };
const visible = run(t.visible), hidden = t.hidden.map(run);
console.log(JSON.stringify({ visible, hidden, pass: visible && hidden.every(Boolean) }));
process.exit(visible && hidden.every(Boolean) ? 0 : 1);
