#!/usr/bin/env node
// Reviewer experiment: can a cold model answer effect questions about a program it has never seen?
//   node bench/review/run.mjs prompt <program-base> <holv|ts>     prints the prompt (program + six questions)
//   node bench/review/run.mjs score  <program-base> <holv|ts> <answers.json>   scores the reviewer's JSON answers
//   node bench/review/run.mjs summarize                              table over bench/review/results/*.json
// The reviewer answers {"f17:Net": true, ...}. It is told to read only; no running, no tools beyond Read and Write.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const [, , mode, base, lang, answersFile] = process.argv;

if (mode === "prompt") {
  const meta = JSON.parse(fs.readFileSync(`${base}.json`, "utf8"));
  const src = fs.readFileSync(`${base}.${lang === "holv" ? "holv" : "ts"}`, "utf8");
  const intro = lang === "holv"
    ? `The program below is written in holv. In holv a function can only use a capability (Clock, Store, Net) that it receives as a parameter, and every function that receives one, directly or through any function it calls, must list it on an \`effects\` line under its signature; the compiler enforces this, so the \`effects\` line is exact and complete.`
    : `The program below is written in TypeScript. The capabilities \`clock\`, \`store\` and \`net\` are module-level objects; a function can reach one by using it directly or by calling a function that does, at any depth.`;
  const qs = meta.questions.map((q, i) => `${i + 1}. Can ${q.fn} observe or use ${q.effect} (directly or through any function it calls)?`).join("\n");
  process.stdout.write(`${intro}\n\nAnswer the questions by reading the program. Do not run anything. Reply by writing a JSON object to the file named at the end, with one key per question in the form "${meta.questions[0].fn}:${meta.questions[0].effect}" and a boolean value. Nothing else in the file.\n\n# Program\n\n\`\`\`\n${src}\n\`\`\`\n\n# Questions\n${qs}\n\nKeys, in order: ${meta.questions.map((q) => `"${q.fn}:${q.effect}"`).join(", ")}\n`);
  process.exit(0);
}
if (mode === "score") {
  const meta = JSON.parse(fs.readFileSync(`${base}.json`, "utf8"));
  const got = JSON.parse(fs.readFileSync(answersFile, "utf8"));
  const rows = meta.questions.map((q) => { const key = `${q.fn}:${q.effect}`; return { key, expected: q.answer, got: got[key], correct: got[key] === q.answer }; });
  const out = { program: path.basename(base), lang, fns: meta.fns, correct: rows.filter((r) => r.correct).length, total: rows.length, rows };
  fs.mkdirSync(path.join(HERE, "results"), { recursive: true });
  fs.writeFileSync(path.join(HERE, "results", `${path.basename(base)}-${lang}.json`), JSON.stringify(out, null, 1));
  console.log(JSON.stringify({ program: out.program, lang, fns: out.fns, correct: out.correct, total: out.total, wrong: rows.filter((r) => !r.correct).map((r) => r.key) }));
  process.exit(0);
}
if (mode === "summarize") {
  const dir = path.join(HERE, "results");
  const rows = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
  const sizes = [...new Set(rows.map((r) => r.fns))].sort((a, b) => a - b);
  console.log(`${"fns".padEnd(8)}${"holv".padStart(10)}${"ts".padStart(10)}`);
  for (const s of sizes) {
    const cell = (lang) => { const rs = rows.filter((r) => r.fns === s && r.lang === lang); const c = rs.reduce((a, r) => a + r.correct, 0), t = rs.reduce((a, r) => a + r.total, 0); return t ? `${c}/${t}` : "-"; };
    console.log(`${String(s).padEnd(8)}${cell("holv").padStart(10)}${cell("ts").padStart(10)}`);
  }
  process.exit(0);
}
console.error("usage: run.mjs prompt|score|summarize ..."); process.exit(2);
