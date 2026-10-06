#!/usr/bin/env node
// Conformance runner. Every tests/*.holv declares its expectation in a header comment:
//   -- expect: ok                      check passes
//   -- expect: error E031 E054         check fails and reports each code
//   -- expect: run => line1\nline2     run (with `-- args: ...`) and compare stdout exactly
//   -- expect: hole fnName             run stops at a hole in fnName, exit 3
//   -- expect: run-fail text           run exits non-zero and stderr contains text (build or runtime errors)
//   -- expect: examples                `holvc test` passes
//   -- expect: examples-fail           `holvc test` fails
// Every file that is expected to compile is also checked for fmt idempotence and fmt output still passing check.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const HOLVC = path.join(HERE, "..", "holvc.mjs");
const env = { ...process.env, HOLV_NOW: "1700000000", HOLV_SEED: "42" };
const holvc = (args, extraEnv = {}) => spawnSync(process.execPath, [HOLVC, ...args], { encoding: "utf8", env: { ...env, ...extraEnv } });

function header(src) {
  const h = { expect: null, args: [] };
  for (const line of src.split("\n")) {
    const m = line.match(/^-- (expect|args): (.*)$/);
    if (!m) continue;
    if (m[1] === "args") h.args = m[2].trim().split(/\s+/);
    else h.expect = m[2].trim();
  }
  return h;
}
const codes = (stderr) => [...stderr.matchAll(/"code":"(E\d+)"/g)].map((m) => m[1]);
// Every error line an agent sees must say what to do. No exceptions, no "see docs".
const lacksFix = (stderr) => stderr.split("\n").filter((l) => l.startsWith("{") && (l.includes('"code":') || l.includes('"error":')) && !/"fix":\{"do":"(?:[^"\\]|\\.){10,}/.test(l));
const unescape = (s) => s.replace(/\\n/g, "\n");

function fmtRoundTrip(file) {
  const tmp = path.join(HERE, ".fmt.tmp.holv");
  const f1 = holvc(["fmt", file]);
  if (f1.status !== 0) return "fmt failed: " + f1.stderr.trim();
  fs.writeFileSync(tmp, f1.stdout);
  const f2 = holvc(["fmt", tmp]);
  const c = holvc(["check", tmp]);
  fs.unlinkSync(tmp);
  if (f1.stdout !== f2.stdout) return "fmt not idempotent";
  if (c.status !== 0) return "fmt output fails check: " + c.stderr.trim();
  return null;
}

function runOne(file) {
  const src = fs.readFileSync(file, "utf8");
  const { expect, args } = header(src);
  if (!expect) return "no `-- expect:` header";
  const [kind, ...rest] = expect.split(/\s+/);
  if (kind === "ok" || kind === "error") {
    const r = holvc(["check", file]);
    if (kind === "ok") return r.status === 0 ? fmtRoundTrip(file) : "check failed: " + r.stderr.trim();
    if (r.status === 0) return "check passed, expected " + rest.join(" ");
    const noFix = lacksFix(r.stderr);
    if (noFix.length) return "error without fix.do: " + noFix[0];
    const got = codes(r.stderr);
    const missing = rest.filter((c) => !got.includes(c));
    return missing.length ? `missing ${missing.join(" ")}, got ${got.join(" ") || "nothing"}` : null;
  }
  if (kind === "run") {
    const want = unescape(expect.slice(expect.indexOf("=>") + 2).trim());
    const r = holvc(["run", file, ...args]);
    if (r.status !== 0) return `exit ${r.status}: ${r.stderr.trim().split("\n")[0]}`;
    return r.stdout.trim() === want ? fmtRoundTrip(file) : `stdout ${JSON.stringify(r.stdout.trim())}, expected ${JSON.stringify(want)}`;
  }
  if (kind === "hole") {
    const r = holvc(["run", file, ...args]);
    if (r.status !== 3) return `exit ${r.status}, expected 3`;
    const m = r.stderr.match(/"hole":"([^:"]+)/);
    return m && m[1] === rest[0] ? fmtRoundTrip(file) : `hole at ${m?.[1] ?? "?"}, expected ${rest[0]}`;
  }
  if (kind === "run-fail") {
    const want = rest.join(" ");
    const r = holvc(["run", file, ...args]);
    if (r.status === 0) return "run succeeded, expected failure";
    const noFix = lacksFix(r.stderr);
    if (noFix.length) return "error without fix.do: " + noFix[0];
    if (/^\s+at .*\(/m.test(r.stderr)) return "stack trace leaked to stderr";
    return r.stderr.includes(want) ? null : `stderr lacks ${JSON.stringify(want)}: ${r.stderr.trim().split("\n")[0]}`;
  }
  if (kind === "examples" || kind === "examples-fail") {
    const r = holvc(["test", file]);
    const passed = r.status === 0;
    if (kind === "examples") return passed ? fmtRoundTrip(file) : "examples failed: " + r.stdout.trim();
    return passed ? "examples passed, expected failure" : null;
  }
  return `unknown expectation ${kind}`;
}

const only = process.argv[2];
const files = fs.readdirSync(HERE).filter((f) => f.endsWith(".holv") && !f.startsWith(".") && (!only || f.includes(only))).sort();
let failed = 0;
for (const f of files) {
  const err = runOne(path.join(HERE, f));
  if (err) failed++;
  console.log(JSON.stringify({ test: f, pass: !err, ...(err ? { why: err } : {}) }));
}
console.log(JSON.stringify({ total: files.length, failed }));
process.exit(failed ? 1 : 0);
