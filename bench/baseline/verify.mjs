#!/usr/bin/env node
// For every attempts/*.ts (exports `pure(x: number): number`, declared to have no effects): lint it; if accepted, install
// tripwires on every ambient effect and call pure(1) in a child process. BLOCKED = linter rejected; ESCAPED = accepted and a
// tripwire fired (the guarantee is broken); HARMLESS = accepted, nothing fired.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(HERE, "attempts");
const trip = `
import { createRequire } from "node:module";
const hit = []; const t = (n) => { hit.push(n); };
const RealDate = Date; globalThis.Date = new Proxy(RealDate, { construct(a, b) { t("Date"); return new RealDate(...b); }, get(a, k) { if (k === "now") t("Date.now"); return a[k]; } });
Math.random = () => { t("Math.random"); return 0.5; };
console.log = console.error = console.info = () => t("console");
const w = process.stdout.write.bind(process.stdout); process.stdout.write = () => { t("stdout"); return true; };
globalThis.fetch = () => { t("fetch"); return Promise.reject(new Error("tripwire")); };
const ph = process.hrtime; process.hrtime = new Proxy(ph, { apply() { t("hrtime"); return [0, 0]; } });
performance.now = () => { t("performance.now"); return 0; };
const req = createRequire(import.meta.url); const fs = req("node:fs");
for (const k of ["readFileSync", "writeFileSync", "readdirSync", "existsSync"]) fs[k] = () => { t("fs." + k); return ""; };
const m = await import(process.argv[2]);
let r; try { r = m.pure(1); } catch (e) { r = "threw"; }
w(JSON.stringify({ hit, r: String(r) }) + "\\n");
`;
fs.writeFileSync(path.join(HERE, ".trip.mjs"), trip);
let escaped = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".ts")).sort()) {
  const file = path.join(dir, f);
  const l = spawnSync(process.execPath, [path.join(HERE, "lint.mjs"), file], { encoding: "utf8" });
  if (l.status !== 0) { console.log(`BLOCKED   ${f}  ${l.stdout.split("\n")[0].replace(/^.*?:\d+:\d+ /, "")}`); continue; }
  const r = spawnSync(process.execPath, ["--experimental-strip-types", "--no-warnings", path.join(HERE, ".trip.mjs"), file], { encoding: "utf8" });
  let out; try { out = JSON.parse(r.stdout.trim().split("\n").pop()); } catch { out = { hit: [], r: `harness error: ${r.stderr.slice(0, 80)}` }; }
  if (out.hit.length) { escaped = 1; console.log(`ESCAPED   ${f}  tripwire: ${out.hit.join(", ")}`); } else console.log(`HARMLESS  ${f}  no effect observed (${out.r})`);
}
process.exit(escaped);
