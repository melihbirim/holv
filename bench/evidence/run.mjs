#!/usr/bin/env node
// Evidence harness for milestone 2: does an agent reach a correct program in fewer attempts in holv than in TypeScript?
//
//   node bench/evidence/run.mjs --agent "<command that reads a prompt on stdin and writes the requested file>" [--tasks a,b] [--langs ts,holv] [--max 5]
//
// For each task and language the runner builds a self-contained prompt (task text, the file to write, and for holv the
// full output of `holvc spec`), runs the agent, then checks the written file: compile (holv: `holvc check`; ts: node
// syntax), the visible example from the task, and the hidden cases. On failure it feeds the agent a structured report
// (compile errors verbatim; for a hidden failure only the input, never the expected output) and tries again, up to --max.
// Results go to bench/evidence/results/<timestamp>.jsonl, one line per (task, lang), plus a summary table on stdout.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");
const HOLVC = path.join(ROOT, "holvc.mjs");
const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const AGENT = opt("--agent");
if (!AGENT) { console.error("usage: run.mjs --agent \"<cmd>\" [--tasks a,b] [--langs ts,holv] [--max 5]"); process.exit(2); }
const MAX = Number(opt("--max", 5));
const LANGS = opt("--langs", "ts,holv").split(",");
const TASKS = opt("--tasks", fs.readdirSync(path.join(HERE, "tasks")).sort().join(",")).split(",");
const SPEC = spawnSync(process.execPath, [HOLVC, "spec"], { encoding: "utf8" }).stdout;
const env = { ...process.env, HOLV_NOW: "1700000000", HOLV_SEED: "42" };

function runProgram(lang, file, args) {
  const r = lang === "holv"
    ? spawnSync(process.execPath, [HOLVC, "run", file, ...args], { encoding: "utf8", env, timeout: 20000 })
    : spawnSync(process.execPath, [file, ...args], { encoding: "utf8", env, timeout: 20000 });
  return { ok: r.status === 0, stdout: (r.stdout ?? "").trim(), stderr: (r.stderr ?? "").trim() };
}
function compileCheck(lang, file) {
  if (lang === "holv") { const r = spawnSync(process.execPath, [HOLVC, "check", file], { encoding: "utf8" }); return r.status === 0 ? null : r.stderr.trim(); }
  const r = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  return r.status === 0 ? null : r.stderr.trim();
}
function verify(lang, file, task) {
  const compile = compileCheck(lang, file);
  if (compile) return { stage: "compile", report: compile };
  const vis = runProgram(lang, file, task.visible.args.map(String));
  if (!vis.ok) return { stage: "visible_crash", report: vis.stderr.split("\n").slice(0, 3).join("\n") };
  if (vis.stdout !== task.visible.stdout.trim()) return { stage: "visible_wrong", report: `for input ${task.visible.args.join(" ")} expected:\n${task.visible.stdout.trim()}\ngot:\n${vis.stdout}` };
  for (const c of task.hidden) {
    const r = runProgram(lang, file, c.args.map(String));
    if (!r.ok) return { stage: "hidden_crash", report: `the program failed for input ${c.args.join(" ")}:\n${r.stderr.split("\n").slice(0, 3).join("\n")}` };
    if (r.stdout !== c.stdout.trim()) return { stage: "hidden_wrong", report: `a hidden case failed for input ${c.args.join(" ")}` };
  }
  return null;
}
function prompt(lang, task, file, feedback) {
  const head = lang === "holv"
    ? `You are writing a program in holv, a language you do not know. Its complete specification follows; it is the only source of truth.\n\n${SPEC}\n\n`
    : `You are writing a program in plain JavaScript for Node 22 (an ES module, no dependencies).\n\n`;
  const io = lang === "holv"
    ? `Write the complete program to the file ${file}. Entry point: fn main(out: Out, ${task.params.map((p) => `${p}: Int`).join(", ")}) -> Int with effects Out, declaring cap Out { print(s: String): Unit }. Print each output line with out.print. Return 0.`
    : `Write the complete program to the file ${file}. Read the integer argument(s) ${task.params.join(", ")} from process.argv.slice(2). Print each output line with console.log.`;
  const fb = feedback ? `\n\nYour previous attempt was checked. Result:\n${feedback}\n\nRewrite the whole file.` : "";
  return `${head}# Task\n${task.text.trim()}\n\n# Visible example\ninput: ${task.visible.args.join(" ")}\noutput:\n${task.visible.stdout.trim()}\n\n# Output\n${io} Write only the file; do not explain.${fb}\n`;
}

fs.mkdirSync(path.join(HERE, "results"), { recursive: true });
const out = path.join(HERE, "results", `${new Date().toISOString().replace(/[:.]/g, "-")}.jsonl`);
const rows = [];
for (const name of TASKS) {
  const task = JSON.parse(fs.readFileSync(path.join(HERE, "tasks", name, "task.json"), "utf8"));
  task.text = fs.readFileSync(path.join(HERE, "tasks", name, "task.md"), "utf8");
  for (const lang of LANGS) {
    const work = path.join(HERE, "work", name, lang);
    fs.rmSync(work, { recursive: true, force: true }); fs.mkdirSync(work, { recursive: true });
    const file = path.join(work, lang === "holv" ? "solution.holv" : "solution.mjs");
    const row = { task: name, lang, attempts: 0, passed: false, stages: [], feedback: [], agent_ms: 0 };
    let feedback = null;
    for (let i = 1; i <= MAX; i++) {
      row.attempts = i;
      const t = Date.now();
      const a = spawnSync("sh", ["-c", AGENT], { input: prompt(lang, task, file, feedback), encoding: "utf8", env: { ...env, HOLV_TASK: name, HOLV_LANG: lang, HOLV_FILE: file }, timeout: 300000 });
      row.agent_ms += Date.now() - t;
      if (!fs.existsSync(file)) { row.stages.push("no_file"); feedback = `no file was written at ${file}`; row.feedback.push(feedback); continue; }
      fs.copyFileSync(file, `${file}.attempt${i}`); // keep every attempt; the failures are the data
      const v = verify(lang, file, task);
      if (!v) { row.passed = true; row.stages.push("pass"); break; }
      row.stages.push(v.stage); feedback = v.report; row.feedback.push(v.report.slice(0, 2000));
    }
    row.first_try = row.stages[0] === "pass";
    row.compile_failures = row.stages.filter((s) => s === "compile").length;
    row.silent_wrong = !row.passed && row.stages[row.stages.length - 1] === "hidden_wrong";
    rows.push(row);
    fs.appendFileSync(out, JSON.stringify(row) + "\n");
    console.error(JSON.stringify(row));
  }
}
const by = (lang) => rows.filter((r) => r.lang === lang);
const col = (lang, f) => by(lang).length ? f(by(lang)) : "-";
const sum = (xs, f) => xs.reduce((a, r) => a + f(r), 0);
console.log(`\n${"metric".padEnd(28)}${LANGS.map((l) => l.padStart(8)).join("")}`);
for (const [label, f] of [
  ["tasks", (xs) => xs.length],
  ["passed", (xs) => sum(xs, (r) => r.passed ? 1 : 0)],
  ["first-try pass", (xs) => sum(xs, (r) => r.first_try ? 1 : 0)],
  ["mean attempts", (xs) => (sum(xs, (r) => r.attempts) / xs.length).toFixed(2)],
  ["compile failures", (xs) => sum(xs, (r) => r.compile_failures)],
  ["silent wrong (final)", (xs) => sum(xs, (r) => r.silent_wrong ? 1 : 0)],
  ["agent seconds", (xs) => (sum(xs, (r) => r.agent_ms) / 1000).toFixed(0)],
]) console.log(`${label.padEnd(28)}${LANGS.map((l) => String(col(l, f)).padStart(8)).join("")}`);
console.log(`\nresults: ${path.relative(ROOT, out)}`);
