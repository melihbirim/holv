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
// Two-phase mode, for an orchestrator that dispatches prompts itself (e.g. subagents on a plan instead of API credit):
//   run.mjs prompt --task t --lang l      prints the prompt for the next attempt (with feedback from the last one)
//   run.mjs verify --task t --lang l      checks the written file, records the attempt, prints {pass, stage, report}
//   run.mjs summarize [--label x]         builds the results file and the table from the recorded attempts
const MODE = ["prompt", "verify", "summarize"].includes(argv[0]) ? argv[0] : "loop";
const AGENT = opt("--agent");
if (MODE === "loop" && !AGENT) { console.error("usage: run.mjs --agent \"<cmd>\" [--tasks a,b] [--langs ts,holv] [--max 5] | run.mjs prompt|verify --task t --lang l | run.mjs summarize"); process.exit(2); }
const MAX = Number(opt("--max", 5));
const LANGS = opt("--langs", "ts,holv").split(",");
const TASKS = opt("--tasks", fs.readdirSync(path.join(HERE, "tasks")).sort().join(",")).split(",");
const SPEC = spawnSync(process.execPath, [HOLVC, "spec"], { encoding: "utf8" }).stdout;
const env = { ...process.env, HOLV_NOW: "1700000000", HOLV_SEED: "42" };

// Language table: file extension, how to compile (null = nothing to compile), how to run, and the prompt head.
// Compiled languages run the binary next to the source. Zig uses ReleaseSafe on purpose: that is the build the
// language recommends, and its overflow behaviour (trap) is part of what is being measured.
const sh = (cmd, args, cwd) => spawnSync(cmd, args, { encoding: "utf8", env, cwd, timeout: 120000 });
const LANGTAB = {
  holv: { ext: "holv", compile: (f) => sh(process.execPath, [HOLVC, "check", f]), run: (f, a) => sh(process.execPath, [HOLVC, "run", f, ...a]),
    head: () => `You are writing a program in holv, a language you do not know. Its complete specification follows; it is the only source of truth.\n\n${SPEC}\n\n`,
    io: (t) => `Entry point: fn main(out: Out, ${t.sig.map((p) => `${p.name}: ${p.type}`).join(", ")}) -> Int with effects Out, declaring cap Out { print(s: String): Unit }. Print each output line with out.print. Return 0.` },
  ts: { ext: "mjs", compile: (f) => sh(process.execPath, ["--check", f]), run: (f, a) => sh(process.execPath, [f, ...a]),
    head: () => "You are writing a program in plain JavaScript for Node 22 (an ES module, no dependencies).\n\n",
    io: (t) => `Read the argument(s) ${argList(t)} from process.argv.slice(2), in that order. Print each output line with console.log.` },
  go: { ext: "go", compile: (f) => sh("go", ["build", "-o", path.join(path.dirname(f), "solution"), f], path.dirname(f)), run: (f, a) => sh(path.join(path.dirname(f), "solution"), a),
    head: () => "You are writing a program in Go 1.25 (a single file, package main, standard library only).\n\n",
    io: (t) => `Read the argument(s) ${argList(t)} from os.Args[1:], in that order. Print each output line with fmt.Println.` },
  rust: { ext: "rs", compile: (f) => sh("rustc", ["-O", "-o", path.join(path.dirname(f), "solution"), f]), run: (f, a) => sh(path.join(path.dirname(f), "solution"), a),
    head: () => "You are writing a program in Rust (a single file compiled with rustc, no crates; it will be built with -O, a release build).\n\n",
    io: (t) => `Read the argument(s) ${argList(t)} from std::env::args(), in that order. Print each output line with println!.` },
  zig: { ext: "zig", compile: (f) => sh("zig", ["build-exe", f, "-O", "ReleaseSafe", `-femit-bin=${path.join(path.dirname(f), "solution")}`], path.dirname(f)), run: (f, a) => sh(path.join(path.dirname(f), "solution"), a),
    head: () => "You are writing a program in Zig 0.15.2 (a single file, standard library only; it will be built with -O ReleaseSafe). Note that in Zig 0.15 the standard writer API changed: stdout is `var buf: [1024]u8 = undefined; var w = std.fs.File.stdout().writer(&buf); const out = &w.interface;` then `try out.print(...)` and `try out.flush()` at the end.\n\n",
    io: (t) => `Read the argument(s) ${argList(t)} from std.process.argsAlloc, in that order. Print each output line to stdout.` },
  c: { ext: "c", compile: (f) => sh("cc", ["-O2", "-o", path.join(path.dirname(f), "solution"), f]), run: (f, a) => sh(path.join(path.dirname(f), "solution"), a),
    head: () => "You are writing a program in C (C11, a single file, standard library only; it will be built with cc -O2).\n\n",
    io: (t) => `Read the argument(s) ${argList(t)} from argv, in that order. Print each output line with printf and a trailing newline.` },
};
function runProgram(lang, file, args) {
  const r = LANGTAB[lang].run(file, args);
  return { ok: r.status === 0, stdout: (r.stdout ?? "").trim(), stderr: (r.stderr ?? "").trim() };
}
function compileCheck(lang, file) {
  const r = LANGTAB[lang].compile(file);
  return r.status === 0 ? null : ((r.stderr ?? "") + (r.stdout ?? "")).trim().slice(0, 3000);
}
function verify(lang, file, task) {
  const compile = compileCheck(lang, file);
  if (compile) return { stage: "compile", report: compile };
  const vis = runProgram(lang, file, task.visible.args.map(String));
  if (!vis.ok) return { stage: "visible_crash", report: vis.stderr.split("\n").slice(0, 3).join("\n") };
  if (vis.stdout !== task.visible.stdout.trim()) return { stage: "visible_wrong", report: `for input ${task.visible.args.join(" ")} expected:\n${task.visible.stdout.trim()}\ngot:\n${vis.stdout}` };
  for (const c of task.hidden) {
    const r = runProgram(lang, file, c.args.map(String));
    const shown = c.args.map((v) => (typeof v === "string" ? JSON.stringify(v) : String(v))).join(" ");
    if (!r.ok) return { stage: "hidden_crash", report: `the program failed for input ${shown}:\n${r.stderr.split("\n").slice(0, 3).join("\n")}` };
    if (r.stdout !== c.stdout.trim()) return { stage: "hidden_wrong", report: `a hidden case failed for input ${shown}` };
  }
  return null;
}
function prompt(lang, task, file, feedback) {
  const head = LANGTAB[lang].head();
  const io = `Write the complete program to the file ${file}. ${LANGTAB[lang].io(task)}`;
  const fb = feedback ? `\n\nYour previous attempt was checked. Result:\n${feedback}\n\nRewrite the whole file.` : "";
  const showArgs = (a) => a.map((v) => (typeof v === "string" ? JSON.stringify(v) : String(v))).join(" ");
  return `${head}# Task\n${task.text.trim()}\n\n# Visible example\ninput: ${showArgs(task.visible.args)}\noutput:\n${task.visible.stdout.trim()}\n\n# Output\n${io} Write only the file; do not explain.${fb}\n`;
}

const loadTask = (name) => { const t = JSON.parse(fs.readFileSync(path.join(HERE, "tasks", name, "task.json"), "utf8")); t.text = fs.readFileSync(path.join(HERE, "tasks", name, "task.md"), "utf8"); t.sig = t.params.map((p) => { const [n, ty] = p.split(":"); return { name: n, type: ty ?? "Int" }; }); return t; };
const argList = (t) => t.sig.map((p) => `${p.name} (${p.type === "String" ? "a string" : "an integer"})`).join(", ");
const cell = (name, lang) => { const work = path.join(HERE, "work", name, lang); fs.mkdirSync(work, { recursive: true }); return { work, file: path.join(work, `solution.${LANGTAB[lang].ext}`), state: path.join(work, "state.json") }; };
const finish = (row) => { row.first_try = row.stages[0] === "pass"; row.compile_failures = row.stages.filter((s) => s === "compile").length; row.silent_wrong = !row.passed && row.stages[row.stages.length - 1] === "hidden_wrong"; return row; };
function table(rows, out) {
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
    ["first attempt: silent wrong", (xs) => sum(xs, (r) => r.stages[0] === "hidden_wrong" || r.stages[0] === "visible_wrong" ? 1 : 0)],
    ["first attempt: loud failure", (xs) => sum(xs, (r) => ["hidden_crash", "visible_crash", "compile"].includes(r.stages[0]) ? 1 : 0)],
    ["agent seconds", (xs) => (sum(xs, (r) => r.agent_ms) / 1000).toFixed(0)],
  ]) console.log(`${label.padEnd(28)}${LANGS.map((l) => String(col(l, f)).padStart(8)).join("")}`);
  console.log(`\nresults: ${path.relative(ROOT, out)}`);
}
if (MODE === "prompt") {
  const name = opt("--task"), lang = opt("--lang"), task = loadTask(name), c = cell(name, lang);
  const st = fs.existsSync(c.state) ? JSON.parse(fs.readFileSync(c.state, "utf8")) : { stages: [], feedback: [], started: Date.now() };
  if (!fs.existsSync(c.state)) fs.writeFileSync(c.state, JSON.stringify(st));
  fs.rmSync(c.file, { force: true }); // each attempt writes a fresh file; previous attempts are kept as .attemptN by verify
  process.stdout.write(prompt(lang, task, c.file, st.feedback.length ? st.feedback[st.feedback.length - 1] : null));
  process.exit(0);
}
if (MODE === "verify") {
  const name = opt("--task"), lang = opt("--lang"), task = loadTask(name), c = cell(name, lang);
  const st = JSON.parse(fs.readFileSync(c.state, "utf8"));
  const i = st.stages.length + 1;
  let v;
  if (!fs.existsSync(c.file)) v = { stage: "no_file", report: `no file was written at ${c.file}` };
  else { fs.copyFileSync(c.file, `${c.file}.attempt${i}`); v = verify(lang, c.file, task); }
  st.stages.push(v ? v.stage : "pass"); if (v) st.feedback.push(v.report.slice(0, 2000));
  st.passed = !v; st.attempts = i; st.agent_ms = Date.now() - st.started;
  fs.writeFileSync(c.state, JSON.stringify(st));
  console.log(JSON.stringify({ task: name, lang, attempt: i, pass: !v, stage: v?.stage ?? "pass", report: v?.report ?? "" }));
  process.exit(0);
}
if (MODE === "summarize") {
  fs.mkdirSync(path.join(HERE, "results"), { recursive: true });
  const out = path.join(HERE, "results", `${new Date().toISOString().replace(/[:.]/g, "-")}${opt("--label") ? "-" + opt("--label") : ""}.jsonl`);
  const rows = [];
  for (const name of TASKS) for (const lang of LANGS) {
    const c = cell(name, lang); if (!fs.existsSync(c.state)) continue;
    const st = JSON.parse(fs.readFileSync(c.state, "utf8"));
    rows.push(finish({ task: name, lang, attempts: st.attempts ?? st.stages.length, passed: !!st.passed, stages: st.stages, feedback: st.feedback, agent_ms: st.agent_ms ?? 0 }));
  }
  for (const r of rows) fs.appendFileSync(out, JSON.stringify(r) + "\n");
  table(rows, out); process.exit(0);
}

fs.mkdirSync(path.join(HERE, "results"), { recursive: true });
const out = path.join(HERE, "results", `${new Date().toISOString().replace(/[:.]/g, "-")}.jsonl`);
const rows = [];
for (const name of TASKS) {
  const task = loadTask(name);
  for (const lang of LANGS) {
    const work = path.join(HERE, "work", name, lang);
    fs.rmSync(work, { recursive: true, force: true }); fs.mkdirSync(work, { recursive: true });
    const file = path.join(work, `solution.${LANGTAB[lang].ext}`);
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
    finish(row);
    rows.push(row);
    fs.appendFileSync(out, JSON.stringify(row) + "\n");
    console.error(JSON.stringify(row));
  }
}
table(rows, out);
