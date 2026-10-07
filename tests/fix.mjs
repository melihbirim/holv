#!/usr/bin/env node
// holvc fix on examples/bad.holv: every mechanical fix is applied, only errors without a machine edit remain, and the result is canonical.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const HOLVC = path.join(HERE, "..", "holvc.mjs");
const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "holv-fix-")), "bad.holv");
fs.copyFileSync(path.join(HERE, "..", "examples", "bad.holv"), tmp);
const r = spawnSync(process.execPath, [HOLVC, "fix", tmp], { encoding: "utf8" });
const left = [...r.stderr.matchAll(/"code":"(E\d+)"/g)].map((m) => m[1]).sort().join(" ");
const fixed = r.stdout.split("\n").filter((l) => l.includes('"fixed"')).length;
const canonical = spawnSync(process.execPath, [HOLVC, "fmt", tmp, "--check"], { encoding: "utf8" }).status === 0;
const again = spawnSync(process.execPath, [HOLVC, "fix", tmp], { encoding: "utf8" });
const idempotent = !again.stdout.includes('"fixed"');
const hasMachineFix = /"fix":\{[^}]*"(replace|add_effect|insert_line_1)"/.test(r.stderr);
const ok = r.status === 1 && left === "E022 E031 E056" && fixed === 3 && canonical && idempotent && !hasMachineFix;
console.log(ok ? "ok" : `FAIL left=${left} fixed=${fixed} canonical=${canonical} idempotent=${idempotent} machineFixLeft=${hasMachineFix}\n${r.stdout}${r.stderr}`);
process.exit(ok ? 0 : 1);
