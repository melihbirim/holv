#!/usr/bin/env node
// Generates a program with a known call graph and known effects, in holv and in TypeScript, plus the ground truth.
//   node bench/review/gen.mjs <fnCount> <seed> <outDir>
// holv: capabilities are parameters, every fn's `effects` line is exactly its transitive effect set (what holvc enforces).
// TypeScript: the natural style, capabilities are module-level objects used wherever convenient; signatures say nothing.
// Bodies are small arithmetic over Int parameters; the only thing that differs between fns is who they call and which
// capabilities they touch. Questions ask which effects a named fn can reach; the answer requires reading one line in
// holv and a traversal in TypeScript.
import fs from "node:fs";
import path from "node:path";

const [, , nArg = "40", seedArg = "1", outDir = "bench/review/programs"] = process.argv;
const N = Number(nArg); let seed = Number(seedArg) >>> 0;
const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
const pick = (xs) => xs[Math.floor(rnd() * xs.length)];
const CAPS = { Clock: "now", Store: "get", Net: "fetch" };

// call graph: fn i may call fns with smaller index (a DAG), leaves sometimes touch a capability directly
const fns = [];
for (let i = 0; i < N; i++) {
  const callees = [];
  const k = i === 0 ? 0 : Math.min(i, 1 + Math.floor(rnd() * 3));
  while (callees.length < k) { const c = Math.floor(rnd() * i); if (!callees.includes(c)) callees.push(c); }
  const direct = rnd() < 0.18 ? [pick(Object.keys(CAPS))] : [];
  fns.push({ name: `f${i}`, callees, direct });
}
for (const f of fns) { // transitive effects, in order Clock, Store, Net
  const set = new Set(f.direct);
  for (const c of f.callees) for (const e of fns[c].effects) set.add(e);
  f.effects = Object.keys(CAPS).filter((e) => set.has(e));
}
const capVar = (c) => c.toLowerCase();

// ---- holv
let h = `holv 0\n\ncap Clock { now(): Int }\ncap Store { get(k: String): Int }\ncap Net { fetch(url: String): Int }\n\n`;
for (const f of fns) {
  const params = [...f.effects.map((e) => `${capVar(e)}: ${e}`), "x: Int"].join(", ");
  h += `fn ${f.name}(${params}) -> Int\n`;
  if (f.effects.length) h += `  effects ${f.effects.join(", ")}\n`;
  h += `{\n`;
  const terms = [`x + ${fns.indexOf(f) + 1}`];
  for (const c of f.callees) { const g = fns[c]; terms.push(`${g.name}(${[...g.effects.map(capVar), "x"].join(", ")})`); }
  for (const e of f.direct) terms.push(e === "Clock" ? `clock.now()` : e === "Store" ? `store.get("k${fns.indexOf(f)}")` : `net.fetch("u${fns.indexOf(f)}")`);
  h += `  ${terms.join(" + ")}\n}\n\n`;
}
h += `fn main(${[...Object.keys(CAPS).map((e) => `${capVar(e)}: ${e}`), "out: Out", "x: Int"].join(", ")}) -> Int\n  effects Clock, Store, Net, Out\n{\n  out.print(str(${fns[N - 1].name}(${[...fns[N - 1].effects.map(capVar), "x"].join(", ")})))\n  0\n}\n`;
h = h.replace("cap Net { fetch(url: String): Int }\n", "cap Net { fetch(url: String): Int }\ncap Out { print(s: String): Unit }\n");

// ---- TypeScript, the way it is usually written: ambient capabilities, plain signatures
let t = `// capabilities are module-level, as in most codebases\nconst clock = { now: () => Math.floor(Date.now() / 1000) };\nconst store = { get: (k: string): number => k.length };\nconst net = { fetch: (url: string): number => url.length };\n\n`;
for (const f of fns) {
  const terms = [`x + ${fns.indexOf(f) + 1}`];
  for (const c of f.callees) terms.push(`${fns[c].name}(x)`);
  for (const e of f.direct) terms.push(e === "Clock" ? `clock.now()` : e === "Store" ? `store.get("k${fns.indexOf(f)}")` : `net.fetch("u${fns.indexOf(f)}")`);
  t += `function ${f.name}(x: number): number {\n  return ${terms.join(" + ")};\n}\n\n`;
}
t += `console.log(${fns[N - 1].name}(Number(process.argv[2] ?? 1)));\n`;

// ---- questions with exact answers: six fns at varied depth, one effect each
const questions = [];
const candidates = fns.slice(Math.floor(N / 4));
while (questions.length < 6) {
  const f = pick(candidates), e = pick(Object.keys(CAPS));
  if (questions.some((q) => q.fn === f.name && q.effect === e)) continue;
  questions.push({ fn: f.name, effect: e, answer: f.effects.includes(e) });
}
// keep the yes/no balance honest: at least two of each
const yes = questions.filter((q) => q.answer).length;
if (yes < 2 || yes > 4) { for (const q of questions) { const f = fns.find((g) => g.name === q.fn); const want = questions.filter((x) => x.answer).length < 3; const alt = Object.keys(CAPS).find((e) => f.effects.includes(e) === want); if (alt) { q.effect = alt; q.answer = want; } } }

fs.mkdirSync(outDir, { recursive: true });
const base = path.join(outDir, `g${N}_s${seedArg}`);
fs.writeFileSync(`${base}.holv`, h);
fs.writeFileSync(`${base}.ts`, t);
fs.writeFileSync(`${base}.json`, JSON.stringify({ fns: N, seed: Number(seedArg), questions, effects: Object.fromEntries(fns.map((f) => [f.name, f.effects])) }, null, 1));
console.log(JSON.stringify({ holv: `${base}.holv`, ts: `${base}.ts`, lines: { holv: h.split("\n").length, ts: t.split("\n").length }, questions: questions.map((q) => `${q.fn}:${q.effect}=${q.answer}`) }));
