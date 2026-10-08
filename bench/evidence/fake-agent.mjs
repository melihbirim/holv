#!/usr/bin/env node
// A fake agent that validates the harness plumbing: it ignores the prompt and copies the task's reference solution.
// With --wrong it copies the deliberately wrong reference first, then the right one, to exercise the feedback loop.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const { HOLV_TASK, HOLV_LANG, HOLV_FILE } = process.env;
const ext = HOLV_LANG === "holv" ? "holv" : "mjs";
const dir = path.join(HERE, "tasks", HOLV_TASK);
const wrong = process.argv.includes("--wrong") && !fs.existsSync(HOLV_FILE) && fs.existsSync(path.join(dir, `wrong.${ext}`));
fs.copyFileSync(path.join(dir, wrong ? `wrong.${ext}` : `ref.${ext}`), HOLV_FILE);
