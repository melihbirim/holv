#!/usr/bin/env node
// holvc: compiler for holv (a language for LLM agents).
// Pipeline: lex -> parse -> typecheck -> effect check -> emit TypeScript -> tsc (independent) -> node.
// This file is the whole trusted base that is "ours"; read it once. The independent check is tsc.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LANG_VERSION = 0;

// Every error says what is wrong (msg, expected/got), where (line/col), and what to do (fix.do, an imperative
// sentence an agent can act on without reading anything else; machine fields beside it when the edit is mechanical).
class HolvError extends Error {
  constructor(code, line, col, msg, fix, extra) {
    super(msg); this.code = code; this.line = line; this.col = col; this.extra = extra ?? {};
    this.fix = typeof fix === "string" ? { do: fix } : fix ?? { do: "see holvc spec" };
  }
  toJSON() { return { code: this.code, line: this.line, col: this.col, msg: this.message, ...this.extra, fix: this.fix }; }
}

// ---------------------------------------------------------------- lexer
const KW = new Set(["type","cap","fn","effects","example","let","var","for","in","if","else","hole","div","mod","and","or","not","true","false"]);
const OPS2 = ["..","==","!=","<=",">=","->"];
const OPS1 = "{}()[]<>,:.+-*/=";

function lex(src) {
  const toks = [], comments = [];
  let i = 0, line = 1, col = 1, nl = true;
  const push = (t, v, c) => { toks.push({ t, v, line, col: c, nl }); nl = false; };
  const isId = (c) => /[A-Za-z0-9_]/.test(c ?? "");
  outer: while (i < src.length) {
    const c = src[i];
    if (c === "\n") { i++; line++; col = 1; nl = true; continue; }
    if (c === " " || c === "\t" || c === "\r") { i++; col++; continue; }
    const start = i, scol = col;
    if (c === "-" && src[i + 1] === "-") {
      while (i < src.length && src[i] !== "\n") i++;
      comments.push({ line, text: src.slice(start, i).trimEnd() }); col += i - start; continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      while (isId(src[i])) i++;
      const w = src.slice(start, i); col += i - start;
      push(KW.has(w) ? w : "ident", w, scol); continue;
    }
    if (/[0-9]/.test(c)) {
      while (/[0-9_]/.test(src[i] ?? "")) i++;
      let isF = false;
      if (src[i] === "." && /[0-9]/.test(src[i + 1] ?? "")) { isF = true; i++; while (/[0-9_]/.test(src[i] ?? "")) i++; }
      col += i - start;
      push(isF ? "float" : "int", src.slice(start, i).replace(/_/g, ""), scol); continue;
    }
    if (c === '"') {
      i++;
      while (src[i] !== '"') { if (i >= src.length || src[i] === "\n") throw new HolvError("E001", line, scol, "unterminated string", "close the string with \" on the same line; strings cannot span lines"); if (src[i] === "\\") i++; i++; }
      i++; col += i - start;
      push("string", JSON.parse(src.slice(start, i)), scol); continue;
    }
    for (const op of OPS2) if (src.startsWith(op, i)) { push(op, op, scol); i += 2; col += 2; continue outer; }
    if (OPS1.includes(c)) { push(c, c, scol); i++; col++; continue; }
    throw new HolvError("E002", line, col, `unexpected character ${JSON.stringify(c)}`, `remove ${JSON.stringify(c)}; holv operators are + - * / div mod == != < <= > >= and or not, see holvc spec`);
  }
  push("eof", "", col);
  return { toks, comments };
}

// ---------------------------------------------------------------- parser
const PREC = { or: 1, and: 2, "==": 3, "!=": 3, "<": 4, ">": 4, "<=": 4, ">=": 4, "+": 5, "-": 5, "*": 6, "/": 6, div: 6, mod: 6 };

class Parser {
  constructor(toks) { this.toks = toks; this.p = 0; }
  peek(o = 0) { return this.toks[this.p + o]; }
  at(t) { return this.peek().t === t; }
  eat(t) { return this.at(t) ? this.toks[this.p++] : null; }
  expect(t, what = JSON.stringify(t)) {
    const k = this.peek();
    if (k.t !== t) throw new HolvError("E010", k.line, k.col, `expected ${what}, got ${k.t === "eof" ? "end of file" : JSON.stringify(k.v)}`, `insert ${what} before ${k.t === "eof" ? "the end of the file" : JSON.stringify(k.v)}`, { expected: what, got: k.t === "eof" ? "end of file" : k.v });
    return this.toks[this.p++];
  }
  ident() { return this.expect("ident", "identifier").v; }
  upperName() { const k = this.peek(); const name = this.ident(); if (!/^[A-Z]/.test(name)) throw new HolvError("E012", k.line, k.col, `type and cap names start uppercase: ${name}`, { do: `rename ${name} to ${name[0].toUpperCase() + name.slice(1)} everywhere`, replace: name, with: name[0].toUpperCase() + name.slice(1) }); return name; }
  pos(k) { return { line: k.line, col: k.col }; }

  program() {
    const k = this.peek();
    if (!(k.t === "ident" && k.v === "holv" && this.peek(1).t === "int"))
      throw new HolvError("E003", k.line, k.col, `file must start with 'holv ${LANG_VERSION}'`, { do: `insert the line 'holv ${LANG_VERSION}' as line 1`, insert_line_1: `holv ${LANG_VERSION}` });
    this.p += 2;
    const items = [];
    while (!this.at("eof")) {
      if (this.at("type")) items.push(this.typeDecl());
      else if (this.at("cap")) items.push(this.capDecl());
      else if (this.at("fn")) items.push(this.fnDecl());
      else { const t = this.peek(); throw new HolvError("E011", t.line, t.col, `expected type, cap or fn, got ${JSON.stringify(t.v)}`, "only type, cap and fn declarations are allowed at the top level; move statements into a fn body"); }
    }
    return items;
  }
  typeRef() {
    const k = this.peek();
    const name = this.ident();
    if (!/^[A-Z]/.test(name)) throw new HolvError("E012", k.line, k.col, `type names start uppercase: ${name}`, { do: `rename ${name} to ${name[0].toUpperCase() + name.slice(1)} everywhere`, replace: name, with: name[0].toUpperCase() + name.slice(1) });
    const args = [];
    if (this.eat("<")) { do args.push(this.typeRef()); while (this.eat(",")); this.expect(">"); }
    return { name, args, ...this.pos(k) };
  }
  fields() {
    const out = []; this.expect("{");
    while (!this.at("}")) { const k = this.peek(); const name = this.ident(); this.expect(":"); out.push({ name, type: this.typeRef(), ...this.pos(k) }); if (!this.eat(",")) break; }
    this.expect("}"); return out;
  }
  typeDecl() { const k = this.expect("type"); const name = this.upperName(); return { k: "type", name, fields: this.fields(), ...this.pos(k) }; }
  capDecl() {
    const k = this.expect("cap"); const name = this.upperName(); const methods = [];
    this.expect("{");
    while (!this.at("}")) {
      const m = this.peek(); const mname = this.ident(); const params = this.params(); this.expect(":");
      methods.push({ name: mname, params, ret: this.typeRef(), ...this.pos(m) }); this.eat(",");
    }
    this.expect("}");
    return { k: "cap", name, methods, ...this.pos(k) };
  }
  params() {
    const ps = []; this.expect("(");
    while (!this.at(")")) { const k = this.peek(); const name = this.ident(); this.expect(":"); ps.push({ name, type: this.typeRef(), ...this.pos(k) }); if (!this.eat(",")) break; }
    this.expect(")"); return ps;
  }
  fnDecl() {
    const k = this.expect("fn"); const name = this.ident(); const params = this.params();
    this.expect("->"); const ret = this.typeRef();
    const effects = [];
    if (this.eat("effects")) { do { const e = this.peek(); effects.push({ name: this.ident(), ...this.pos(e) }); } while (this.eat(",")); }
    const examples = [];
    while (this.at("example")) { const e = this.expect("example"); const call = this.binary(PREC["=="] + 1); this.expect("=="); examples.push({ call, expected: this.expr(), ...this.pos(e) }); }
    const body = this.block();
    return { k: "fn", name, params, ret, effects, examples, body, ...this.pos(k) };
  }
  block() {
    const open = this.expect("{"); const stmts = []; let tail = null;
    while (!this.at("}")) {
      const k = this.peek();
      if (this.at("let") || this.at("var")) {
        this.p++; const name = this.ident(); let type = null;
        if (this.eat(":")) type = this.typeRef();
        this.expect("="); stmts.push({ k: "let", mut: k.t === "var", name, type, expr: this.expr(), ...this.pos(k) });
      } else if (this.at("for")) {
        this.p++; const v = this.ident(); this.expect("in"); const from = this.expr(); this.expect(".."); const to = this.expr();
        stmts.push({ k: "for", v, from, to, body: this.block(), ...this.pos(k) });
      } else if (this.at("ident") && this.peek(1).t === "=") {
        const name = this.ident(); this.p++; stmts.push({ k: "assign", name, expr: this.expr(), ...this.pos(k) });
      } else {
        const e = this.expr();
        if (this.at("}")) tail = e; else stmts.push({ k: "expr", expr: e, ...this.pos(k) });
      }
    }
    const close = this.expect("}");
    return { k: "block", stmts, tail, ...this.pos(open), endLine: close.line };
  }
  expr() { return this.binary(0); }
  binary(min) {
    let l = this.unary();
    for (;;) {
      const k = this.peek(); const pr = PREC[k.t];
      if (pr === undefined || pr < min) return l;
      this.p++; const r = this.binary(pr + 1);
      l = { k: "bin", op: k.t, l, r, ...this.pos(k) };
    }
  }
  unary() {
    const k = this.peek();
    if (this.eat("-")) return { k: "neg", e: this.unary(), ...this.pos(k) };
    if (this.eat("not")) return { k: "not", e: this.unary(), ...this.pos(k) };
    return this.postfix(this.primary());
  }
  postfix(e) {
    for (;;) {
      const k = this.peek();
      if (this.eat(".")) {
        const name = this.ident();
        if (this.at("(") && !this.peek().nl) e = { k: "method", obj: e, name, args: this.args(), ...this.pos(k) };
        else e = { k: "field", obj: e, name, ...this.pos(k) };
      } else if (this.at("(") && !k.nl) e = { k: "call", callee: e, args: this.args(), ...this.pos(k) };
      else if (this.at("[") && !k.nl) { this.p++; const idx = this.expr(); this.expect("]"); e = { k: "index", obj: e, idx, ...this.pos(k) }; }
      else return e;
    }
  }
  args() { const a = []; this.expect("("); while (!this.at(")")) { a.push(this.expr()); if (!this.eat(",")) break; } this.expect(")"); return a; }
  primary() {
    const k = this.peek(), p = this.pos(k);
    if (this.eat("int")) return { k: "int", v: k.v, ...p };
    if (this.eat("float")) return { k: "float", v: k.v, ...p };
    if (this.eat("string")) return { k: "string", v: k.v, ...p };
    if (this.eat("true")) return { k: "bool", v: true, ...p };
    if (this.eat("false")) return { k: "bool", v: false, ...p };
    if (this.eat("hole")) return { k: "hole", type: this.typeRef(), ...p };
    if (this.eat("(")) { const e = this.expr(); this.expect(")"); return e; }
    if (this.eat("if")) { const cond = this.expr(); const then = this.block(); this.expect("else"); return { k: "if", cond, then, else: this.block(), ...p }; }
    if (this.eat("fn")) {
      const params = []; this.expect("(");
      while (!this.at(")")) { const t = this.peek(); params.push({ name: this.ident(), ...this.pos(t) }); if (!this.eat(",")) break; }
      this.expect(")"); return { k: "lambda", params, body: this.block(), ...p };
    }
    if (this.at("ident")) {
      const name = this.ident();
      if (/^[A-Z]/.test(name) && this.at("{") && !this.peek().nl) {
        const fields = []; this.p++;
        while (!this.at("}")) { const t = this.peek(); const f = this.ident(); this.expect(":"); fields.push({ name: f, expr: this.expr(), ...this.pos(t) }); if (!this.eat(",")) break; }
        this.expect("}"); return { k: "struct", name, fields, ...p };
      }
      return { k: "ident", name, ...p };
    }
    throw new HolvError("E013", k.line, k.col, `unexpected ${k.t === "eof" ? "end of file" : JSON.stringify(k.v)}`, "complete the expression before this token: a value, a name, a call, or a parenthesised expression is missing");
  }
}

// ---------------------------------------------------------------- types
const prim = (n) => ({ k: "prim", n });
const T = { Int: prim("Int"), Float: prim("Float"), String: prim("String"), Bool: prim("Bool"), Unit: prim("Unit") };
const ERR = { k: "err" }, ANY = { k: "any" };
const listT = (el) => ({ k: "list", el });
function same(a, b) {
  if (a.k === "err" || b.k === "err" || a.k === "any" || b.k === "any") return true;
  if (a.k !== b.k) return false;
  if (a.k === "list") return same(a.el, b.el);
  if (a.k === "fn") return a.params.length === b.params.length && a.params.every((p, i) => same(p, b.params[i])) && same(a.ret, b.ret);
  return a.n === b.n;
}
function show(t) {
  if (t.k === "list") return `List<${show(t.el)}>`;
  if (t.k === "fn") return `fn(${t.params.map(show).join(", ")}) -> ${show(t.ret)}`;
  if (t.k === "err" || t.k === "any") return "?";
  return t.n;
}
const isNum = (t) => t.k === "prim" && (t.n === "Int" || t.n === "Float");
const BUILTINS = {
  sqrt: { params: [T.Float], ret: T.Float, js: "Math.sqrt" },
  floor: { params: [T.Float], ret: T.Int, js: "Math.floor" },
  toFloat: { params: [T.Int], ret: T.Float, js: "" },
  str: { params: [ANY], ret: T.String, js: "String" },
};

class Checker {
  constructor(items) {
    this.items = items; this.errors = [];
    this.structs = new Map(); this.caps = new Map(); this.fns = new Map();
    for (const it of items) {
      const reg = it.k === "type" ? this.structs : it.k === "cap" ? this.caps : this.fns;
      if (this.structs.has(it.name) || this.caps.has(it.name) || this.fns.has(it.name)) this.err("E041", it, `duplicate name ${it.name}`, `rename this ${it.k}; ${it.name} is already declared in this file`);
      reg.set(it.name, it);
    }
  }
  err(code, at, msg, fix, extra) { this.errors.push(new HolvError(code, at.line, at.col, msg, fix, extra)); return ERR; }
  resolveName(t) { return t.name === "List" ? `List<${this.resolveName(t.args[0])}>` : t.name; }
  known() { return ["Int", "Float", "String", "Bool", "Unit", "List<T>", ...this.structs.keys(), ...this.caps.keys()]; }
  resolve(t) {
    if (T[t.name]) return T[t.name];
    if (t.name === "List") { if (t.args.length !== 1) return this.err("E040", t, "List takes one type argument", "write List<T> with exactly one element type"); return listT(this.resolve(t.args[0])); }
    if (this.structs.has(t.name)) return { k: "struct", n: t.name };
    if (this.caps.has(t.name)) return { k: "cap", n: t.name };
    return this.err("E040", t, `unknown type ${t.name}`, `declare 'type ${t.name} { ... }' or 'cap ${t.name} { ... }', or use one of the known types`, { known: this.known() });
  }
  run() {
    for (const s of this.structs.values()) for (const f of s.fields) this.resolve(f.type);
    for (const c of this.caps.values()) for (const m of c.methods) { m.params.forEach((p) => this.resolve(p.type)); this.resolve(m.ret); }
    for (const f of this.fns.values()) {
      const env = new Map();
      for (const p of f.params) env.set(p.name, { t: this.resolve(p.type), mut: false });
      const ret = this.resolve(f.ret);
      const got = this.block(f.body, env, true);
      if (!same(got, ret)) this.err("E050", f.body.tail ?? f, `fn ${f.name} returns ${show(got)}, declared ${show(ret)}`, `make the last expression of fn ${f.name} a ${show(ret)}, or change its declared return type to ${show(got)}`, { expected: show(ret), got: show(got) });
      for (const ex of f.examples) {
        const a = this.expr(ex.call, env), b = this.expr(ex.expected, env);
        if (!same(a, b)) this.err("E051", ex, `example types differ: ${show(a)} vs ${show(b)}`, `the expected value after == must be a ${show(a)}`, { expected: show(a), got: show(b) });
      }
    }
    return this.errors;
  }
  block(b, env, valued) {
    env = new Map(env);
    for (const s of b.stmts) {
      if (s.k === "let") {
        let t = this.expr(s.expr, env);
        if (s.type) { const want = this.resolve(s.type); if (!same(t, want)) this.err("E052", s, `${s.name}: declared ${show(want)}, got ${show(t)}`, `make the value a ${show(want)} or change the annotation to ${show(t)}`, { expected: show(want), got: show(t) }); t = want; }
        else if (t.k === "list" && t.el.k === "any") this.err("E053", s, `${s.name}: List.new() needs an element type`, `write 'let ${s.name}: List<T> = List.new()' with the element type in place of T`);
        env.set(s.name, { t, mut: s.mut });
      } else if (s.k === "assign") {
        const v = env.get(s.name);
        if (!v) { this.err("E030", s, `unknown name ${s.name}`, `declare ${s.name} with let or var before this line, or fix the spelling`, { scope: [...env.keys()] }); continue; }
        if (!v.mut) this.err("E054", s, `${s.name} is immutable; declare it with 'var'`, { do: `change 'let ${s.name}' to 'var ${s.name}' where it is declared`, replace: `let ${s.name}`, with: `var ${s.name}` });
        const t = this.expr(s.expr, env);
        if (!same(t, v.t)) this.err("E052", s, `${s.name}: is ${show(v.t)}, assigned ${show(t)}`, `assign a ${show(v.t)} to ${s.name}; a variable never changes type`, { expected: show(v.t), got: show(t) });
      } else if (s.k === "for") {
        for (const e of [s.from, s.to]) { const t = this.expr(e, env); if (!same(t, T.Int)) this.err("E055", e, `for bounds must be Int, got ${show(t)}`, "make both bounds Int: use div instead of /, or floor() on a Float", { expected: "Int", got: show(t) }); }
        const inner = new Map(env); inner.set(s.v, { t: T.Int, mut: false });
        this.block(s.body, inner, false);
      } else this.expr(s.expr, env);
    }
    return b.tail ? this.expr(b.tail, env) : T.Unit;
  }
  expr(e, env) {
    switch (e.k) {
      case "int": return T.Int;
      case "float": return T.Float;
      case "string": return T.String;
      case "bool": return T.Bool;
      case "ident": {
        const v = env.get(e.name); if (v) return v.t;
        if (this.fns.has(e.name)) { const f = this.fns.get(e.name); return { k: "fn", params: f.params.map((p) => this.resolve(p.type)), ret: this.resolve(f.ret) }; }
        return this.err("E030", e, `unknown name ${e.name}`, `declare ${e.name} with let or var, add it as a parameter, or fix the spelling`, { scope: [...env.keys(), ...this.fns.keys()] });
      }
      case "neg": { const t = this.expr(e.e, env); return isNum(t) || t.k === "err" ? t : this.err("E031", e, `negation needs Int or Float, got ${show(t)}`, "remove the minus or apply it to a number", { expected: "Int or Float", got: show(t) }); }
      case "not": { const t = this.expr(e.e, env); return same(t, T.Bool) ? T.Bool : this.err("E031", e, `not needs Bool, got ${show(t)}`, "apply not to a comparison or a Bool value", { expected: "Bool", got: show(t) }); }
      case "bin": {
        const l = this.expr(e.l, env), r = this.expr(e.r, env);
        if (l.k === "err" || r.k === "err") return ERR;
        const op = e.op;
        if (op === "and" || op === "or") return same(l, T.Bool) && same(r, T.Bool) ? T.Bool : this.err("E031", e, `${op} needs Bool and Bool, got ${show(l)} and ${show(r)}`, `make both sides of ${op} comparisons or Bool values`, { expected: "Bool and Bool", got: `${show(l)} and ${show(r)}` });
        if (!same(l, r)) return this.err("E031", e, `${op}: ${show(l)} and ${show(r)} differ`, isNum(l) && isNum(r) ? `wrap the Int side in toFloat(), or use floor() on the Float side if the result should be Int` : `make both sides of ${op} the same type`, { left: show(l), right: show(r) });
        if (op === "==" || op === "!=") return l.k === "prim" ? T.Bool : this.err("E031", e, `${op} only compares Int, Float, String, Bool`, `compare a field of the ${show(l)} instead, e.g. a.id ${op} b.id`, { got: show(l) });
        if (["<", ">", "<=", ">="].includes(op)) return isNum(l) || same(l, T.String) ? T.Bool : this.err("E031", e, `${op} needs Int, Float or String, got ${show(l)}`, `compare a field of the ${show(l)} instead`, { expected: "Int, Float or String", got: show(l) });
        if (op === "+" && same(l, T.String)) return T.String;
        if (op === "div" || op === "mod") return same(l, T.Int) ? T.Int : this.err("E031", e, `${op} needs Int, got ${show(l)}`, `use / for Float division, or floor() both sides to get Int`, { expected: "Int", got: show(l) });
        if (op === "/") return same(l, T.Float) ? T.Float : this.err("E032", e, `/ needs Float; for Int use div`, { do: "replace / with div for integer division, or wrap both sides in toFloat() for Float division", replace: "/", with: "div" }, { got: show(l) });
        return isNum(l) ? l : this.err("E031", e, `${op} needs Int or Float, got ${show(l)}`, op === "+" ? "+ joins two Strings or adds two numbers; convert with str() to join" : `apply ${op} to numbers`, { expected: "Int or Float", got: show(l) });
      }
      case "field": {
        const t = this.expr(e.obj, env); if (t.k === "err") return ERR;
        if (t.k === "list" && e.name === "len") return T.Int;
        if (t.k === "struct") { const s = this.structs.get(t.n), f = s.fields.find((f) => f.name === e.name); return f ? this.resolve(f.type) : this.err("E033", e, `${t.n} has no field ${e.name}`, `use one of the fields of ${t.n}, or add ${e.name} to its type declaration`, { fields: s.fields.map((f) => f.name) }); }
        return this.err("E033", e, `${show(t)} has no field ${e.name}`, t.k === "list" ? "List has only .len; use xs[i] to read an element" : `${show(t)} has no fields; only declared types and List have`);
      }
      case "index": {
        const t = this.expr(e.obj, env), i = this.expr(e.idx, env); if (t.k === "err") return ERR;
        if (t.k !== "list") return this.err("E033", e, `cannot index ${show(t)}`, "only a List<T> can be indexed with [i]");
        if (!same(i, T.Int)) this.err("E031", e.idx, `index must be Int, got ${show(i)}`, "use an Int index; floor() converts a Float", { expected: "Int", got: show(i) });
        return t.el;
      }
      case "call": {
        if (e.callee.k === "ident" && BUILTINS[e.callee.name]) {
          const b = BUILTINS[e.callee.name];
          return this.checkArgs(e, b.params, e.args, env, e.callee.name) ? b.ret : ERR;
        }
        const ft = this.expr(e.callee, env); if (ft.k === "err") return ERR;
        if (ft.k !== "fn") return this.err("E034", e, `cannot call ${show(ft)}`, `${e.callee.name ?? "this value"} is a ${show(ft)}, not a fn; remove the parentheses or call a declared fn`);
        return this.checkArgs(e, ft.params, e.args, env, e.callee.name ?? "function") ? ft.ret : ERR;
      }
      case "method": {
        if (e.obj.k === "ident" && e.obj.name === "List" && e.name === "new") return listT(ANY);
        const t = this.expr(e.obj, env); if (t.k === "err") return ERR;
        if (t.k === "cap") {
          const m = this.caps.get(t.n).methods.find((m) => m.name === e.name);
          if (!m) return this.err("E033", e, `cap ${t.n} has no method ${e.name}`, `use one of the methods of cap ${t.n}, or add ${e.name} to its declaration and to its implementation`, { methods: this.caps.get(t.n).methods.map((m) => m.name) });
          return this.checkArgs(e, m.params.map((p) => this.resolve(p.type)), e.args, env, `${t.n}.${e.name}`) ? this.resolve(m.ret) : ERR;
        }
        if (t.k === "list") {
          if (e.name === "push") return this.checkArgs(e, [t.el], e.args, env, "push") ? T.Unit : ERR;
          if (e.name === "sortBy") {
            const f = e.args[0];
            if (e.args.length !== 1 || f.k !== "lambda" || f.params.length !== 2) return this.err("E034", e, "sortBy takes one fn(a, b) { ... } returning Int", "write xs.sortBy(fn(a, b) { ... }) with a body that returns a negative, zero or positive Int");
            const inner = new Map(env); for (const p of f.params) inner.set(p.name, { t: t.el, mut: false });
            const r = this.block(f.body, inner, true);
            if (!same(r, T.Int)) this.err("E050", f, `sortBy comparator returns ${show(r)}, must be Int`, "return an Int: a.x - b.x, or if a.x < b.x { -1 } else { 1 }", { expected: "Int", got: show(r) });
            return T.Unit;
          }
          return this.err("E033", e, `List has no method ${e.name}`, "List supports push(v), sortBy(fn), and the field len", { methods: ["push", "sortBy"] });
        }
        return this.err("E033", e, `${show(t)} has no method ${e.name}`, "only caps and List have methods; call a declared fn with the value as an argument instead");
      }
      case "struct": {
        const s = this.structs.get(e.name); if (!s) return this.err("E040", e, `unknown type ${e.name}`, `declare 'type ${e.name} { ... }' before using it as a literal`, { known: this.known() });
        for (const f of s.fields) {
          const given = e.fields.find((g) => g.name === f.name);
          if (!given) { this.err("E056", e, `${e.name} literal missing field ${f.name}`, `add ${f.name}: <${this.resolveName(f.type)}> to the literal; every field is required`, { missing: f.name, fields: s.fields.map((f) => f.name) }); continue; }
          const t = this.expr(given.expr, env), want = this.resolve(f.type);
          if (!same(t, want)) this.err("E052", given, `${e.name}.${f.name}: expected ${show(want)}, got ${show(t)}`, `give ${f.name} a ${show(want)} value`, { expected: show(want), got: show(t) });
        }
        for (const g of e.fields) if (!s.fields.some((f) => f.name === g.name)) this.err("E056", g, `${e.name} has no field ${g.name}`, `remove ${g.name} from the literal, or add it to type ${e.name}`, { extra: g.name, fields: s.fields.map((f) => f.name) });
        return { k: "struct", n: e.name };
      }
      case "lambda": return this.err("E034", e, "fn literals are only allowed as the argument of sortBy in holv 0", "declare a named fn at the top level and call it, or pass the fn literal directly to sortBy");
      case "if": {
        const c = this.expr(e.cond, env); if (!same(c, T.Bool)) this.err("E031", e.cond, `if condition must be Bool, got ${show(c)}`, "write a comparison, e.g. if x != 0 { ... }", { expected: "Bool", got: show(c) });
        const a = this.block(e.then, env, true), b = this.block(e.else, env, true);
        if (!same(a, b)) return this.err("E057", e, `if branches differ: ${show(a)} vs ${show(b)}`, `make the else branch a ${show(a)}, or both branches Unit if the if is a statement`, { then: show(a), else: show(b) });
        return a;
      }
      case "hole": return this.resolve(e.type);
      default: throw new Error("typecheck: unknown node " + e.k);
    }
  }
  checkArgs(at, params, args, env, name) {
    if (params.length !== args.length) { this.err("E035", at, `${name} takes ${params.length} argument(s), got ${args.length}`, `call ${name} with exactly ${params.length} argument(s): (${params.map(show).join(", ")})`, { expected: params.length, got: args.length, params: params.map(show) }); return false; }
    let ok = true;
    args.forEach((a, i) => { const t = this.expr(a, env); if (!same(t, params[i])) { this.err("E052", a, `${name} argument ${i + 1}: expected ${show(params[i])}, got ${show(t)}`, `pass a ${show(params[i])} as argument ${i + 1} of ${name}`, { expected: show(params[i]), got: show(t) }); ok = false; } });
    return ok;
  }
}

// ---------------------------------------------------------------- effect check
// A fn may touch a capability only if it is listed in its `effects`, and it must list every effect of every fn it calls.
function checkEffects(items) {
  const caps = new Set(items.filter((i) => i.k === "cap").map((i) => i.name));
  const fns = items.filter((i) => i.k === "fn");
  const fnEff = new Map(fns.map((f) => [f.name, f.effects.map((e) => e.name)]));
  const errors = [];
  for (const f of fns) {
    const declared = fnEff.get(f.name);
    for (const e of f.effects) if (!caps.has(e.name)) errors.push(new HolvError("E020", e.line, e.col, `fn ${f.name}: unknown effect ${e.name}`, `declare 'cap ${e.name} { ... }' or remove ${e.name} from the effects line`, { known: [...caps] }));
    for (const p of f.params) if (caps.has(p.type.name) && !declared.includes(p.type.name))
      errors.push(new HolvError("E021", p.line, p.col, `fn ${f.name}: takes capability ${p.name}: ${p.type.name} but does not declare 'effects ${p.type.name}'`, { do: `add 'effects ${p.type.name}' on the line after the signature of fn ${f.name}${declared.length ? ` (it already has effects ${declared.join(", ")}; append it there)` : ""}`, fn: f.name, add_effect: p.type.name }));
    const walk = (n) => {
      if (!n || typeof n !== "object") return;
      if (n.k === "call" && n.callee.k === "ident" && fnEff.has(n.callee.name))
        for (const e of fnEff.get(n.callee.name)) if (!declared.includes(e))
          errors.push(new HolvError("E022", n.callee.line, n.callee.col, `fn ${f.name} calls ${n.callee.name} which has effect ${e}`, { do: `add 'effects ${e}' to fn ${f.name}, and pass a ${e} capability down to it from its callers`, fn: f.name, add_effect: e }));
      for (const v of Object.values(n)) Array.isArray(v) ? v.forEach(walk) : walk(v);
    };
    walk(f.body);
  }
  return errors;
}

// ---------------------------------------------------------------- emit TypeScript
const TS = { Int: "number", Float: "number", String: "string", Bool: "boolean", Unit: "void" };
const tsType = (t) => (t.name === "List" ? `${tsType(t.args[0])}[]` : TS[t.name] ?? t.name);
const ind = (n) => "  ".repeat(n);
const JSBIN = { and: "&&", or: "||", "==": "===", "!=": "!==" };

function emit(items, srcName) {
  let out = `// generated by holvc from ${srcName}; do not edit\nimport { hole, at } from "./runtime.ts";\n\n`;
  const examples = [];
  for (const it of items) {
    if (it.k === "type") out += `export type ${it.name} = { ${it.fields.map((f) => `${f.name}: ${tsType(f.type)}`).join("; ")} };\n\n`;
    else if (it.k === "cap") out += `export interface ${it.name} { ${it.methods.map((m) => `${m.name}(${m.params.map((p) => `${p.name}: ${tsType(p.type)}`).join(", ")}): ${tsType(m.ret)}`).join("; ")} }\n\n`;
    else {
      const scope = it.params.map((p) => p.name);
      out += `export function ${it.name}(${it.params.map((p) => `${p.name}: ${tsType(p.type)}`).join(", ")}): ${tsType(it.ret)} ${emitBlock(it.body, scope, it.name, 0, true)}\n\n`;
      for (const ex of it.examples) examples.push(`  [${JSON.stringify(`${it.name}:${ex.line}`)}, () => ${emitExpr(ex.call, scope, it.name)}, ${emitExpr(ex.expected, scope, it.name)}]`);
    }
  }
  out += `export const __examples: Array<[string, () => unknown, unknown]> = [\n${examples.join(",\n")}\n];\n`;
  return out;
}
function emitBlock(b, scope, fn, d, valued) {
  scope = [...scope];
  let s = "{\n";
  for (const st of b.stmts) {
    if (st.k === "let") { s += `${ind(d + 1)}${st.mut ? "let" : "const"} ${st.name}${st.type ? ": " + tsType(st.type) : ""} = ${emitExpr(st.expr, scope, fn)};\n`; scope.push(st.name); }
    else if (st.k === "assign") s += `${ind(d + 1)}${st.name} = ${emitExpr(st.expr, scope, fn)};\n`;
    else if (st.k === "for") s += `${ind(d + 1)}for (let ${st.v} = ${emitExpr(st.from, scope, fn)}; ${st.v} < ${emitExpr(st.to, scope, fn)}; ${st.v}++) ${emitBlock(st.body, [...scope, st.v], fn, d + 1, false)}\n`;
    else s += `${ind(d + 1)}${emitExpr(st.expr, scope, fn)};\n`;
  }
  if (b.tail) s += `${ind(d + 1)}${valued ? "return " : ""}${emitExpr(b.tail, scope, fn)};\n`;
  return s + `${ind(d)}}`;
}
function emitExpr(e, scope, fn) {
  const x = (n) => emitExpr(n, scope, fn);
  switch (e.k) {
    case "int": case "float": return e.v;
    case "string": return JSON.stringify(e.v);
    case "bool": return String(e.v);
    case "ident": return e.name;
    case "neg": return `(-${x(e.e)})`;
    case "not": return `(!${x(e.e)})`;
    case "bin":
      if (e.op === "div") return `Math.trunc(${x(e.l)} / ${x(e.r)})`;
      if (e.op === "mod") return `(${x(e.l)} % ${x(e.r)})`;
      if (["==", "!=", "<", ">", "<=", ">="].includes(e.op)) {
        // widen literal operands so tsc does not reject constant comparisons like 1 == 2 as "no overlap"
        const w = (n) => ({ int: "number", float: "number", string: "string", bool: "boolean" })[n.k] ? `(${x(n)} as ${({ int: "number", float: "number", string: "string", bool: "boolean" })[n.k]})` : x(n);
        return `(${w(e.l)} ${JSBIN[e.op] ?? e.op} ${w(e.r)})`;
      }
      return `(${x(e.l)} ${JSBIN[e.op] ?? e.op} ${x(e.r)})`;
    case "field": return e.name === "len" ? `${x(e.obj)}.length` : `${x(e.obj)}.${e.name}`;
    case "index": return `at(${x(e.obj)}, ${x(e.idx)})`;
    case "call":
      if (e.callee.k === "ident" && BUILTINS[e.callee.name]) return `${BUILTINS[e.callee.name].js}(${e.args.map(x).join(", ")})`;
      return `${x(e.callee)}(${e.args.map(x).join(", ")})`;
    case "method":
      if (e.obj.k === "ident" && e.obj.name === "List" && e.name === "new") return "[]";
      if (e.name === "sortBy") return `${x(e.obj)}.sort(${e.args.map(x).join(", ")})`;
      return `${x(e.obj)}.${e.name}(${e.args.map(x).join(", ")})`;
    case "struct": return `{ ${e.fields.map((f) => `${f.name}: ${x(f.expr)}`).join(", ")} }`;
    case "lambda": return `(${e.params.map((p) => p.name).join(", ")}) => ${emitBlock(e.body, [...scope, ...e.params.map((p) => p.name)], fn, 1, true)}`;
    case "if": {
      const simple = (b) => b.stmts.length === 0 && b.tail;
      if (simple(e.then) && simple(e.else)) return `(${x(e.cond)} ? ${x(e.then.tail)} : ${x(e.else.tail)})`;
      return `(() => { if (${x(e.cond)}) ${emitBlock(e.then, scope, fn, 1, true)} else ${emitBlock(e.else, scope, fn, 1, true)} })()`;
    }
    case "hole": return `hole<${tsType(e.type)}>(${JSON.stringify(`${fn}:${e.line}`)}, ${JSON.stringify(e.type.name)}, { ${scope.join(", ")} })`;
    default: throw new Error("emit: unknown node " + e.k);
  }
}

// ---------------------------------------------------------------- formatter (canonical form)
// One spelling per program. Comments sit on their own line and are re-attached before the next statement.
function format(items, comments) {
  let ci = 0;
  const take = (line, d) => { let s = ""; while (ci < comments.length && comments[ci].line < line) s += `${ind(d)}${comments[ci++].text}\n`; return s; };
  const hasComment = (b) => comments.some((c) => c.line > b.line && c.line < b.endLine);
  const typeRef = (t) => t.args.length ? `${t.name}<${t.args.map(typeRef).join(", ")}>` : t.name;
  const params = (ps) => `(${ps.map((p) => `${p.name}: ${typeRef(p.type)}`).join(", ")})`;
  const stmt = (st, d) => {
    if (st.k === "let") return `${st.mut ? "var" : "let"} ${st.name}${st.type ? ": " + typeRef(st.type) : ""} = ${fx(st.expr, d)}`;
    if (st.k === "assign") return `${st.name} = ${fx(st.expr, d)}`;
    if (st.k === "for") return `for ${st.v} in ${fx(st.from, d)} .. ${fx(st.to, d)} ${block(st.body, d)}`;
    return fx(st.expr, d);
  };
  const block = (b, d) => {
    if (b.stmts.length === 0 && b.tail && !hasComment(b)) return `{ ${fx(b.tail, d)} }`;
    let s = "{\n";
    for (const st of b.stmts) s += take(st.line, d + 1) + `${ind(d + 1)}${stmt(st, d + 1)}\n`;
    if (b.tail) s += take(b.tail.line, d + 1) + `${ind(d + 1)}${fx(b.tail, d + 1)}\n`;
    s += take(b.endLine, d + 1);
    return s + `${ind(d)}}`;
  };
  const fx = (e, d, parent = 0, right = false) => {
    switch (e.k) {
      case "int": case "float": return e.v;
      case "string": return JSON.stringify(e.v);
      case "bool": return String(e.v);
      case "ident": return e.name;
      case "neg": return `-${fx(e.e, d, 99)}`;
      case "not": return `not ${fx(e.e, d, 99)}`;
      case "bin": {
        const p = PREC[e.op], s = `${fx(e.l, d, p)} ${e.op} ${fx(e.r, d, p, true)}`;
        return p < parent || (p === parent && right) ? `(${s})` : s;
      }
      case "field": return `${fx(e.obj, d, 99)}.${e.name}`;
      case "index": return `${fx(e.obj, d, 99)}[${fx(e.idx, d)}]`;
      case "call": return `${fx(e.callee, d, 99)}(${e.args.map((a) => fx(a, d)).join(", ")})`;
      case "method": return `${fx(e.obj, d, 99)}.${e.name}(${e.args.map((a) => fx(a, d)).join(", ")})`;
      case "struct": return `${e.name} { ${e.fields.map((f) => `${f.name}: ${fx(f.expr, d)}`).join(", ")} }`;
      case "lambda": return `fn(${e.params.map((p) => p.name).join(", ")}) ${block(e.body, d)}`;
      case "if": return `if ${fx(e.cond, d)} ${block(e.then, d)} else ${block(e.else, d)}`;
      case "hole": return `hole ${typeRef(e.type)}`;
      default: throw new Error("fmt: unknown node " + e.k);
    }
  };
  let out = `holv ${LANG_VERSION}\n`;
  for (const it of items) {
    out += "\n" + take(it.line, 0);
    if (it.k === "type") out += `type ${it.name} { ${it.fields.map((f) => `${f.name}: ${typeRef(f.type)}`).join(", ")} }\n`;
    else if (it.k === "cap") out += `cap ${it.name} { ${it.methods.map((m) => `${m.name}${params(m.params)}: ${typeRef(m.ret)}`).join(", ")} }\n`;
    else {
      const header = `fn ${it.name}${params(it.params)} -> ${typeRef(it.ret)}`;
      let extra = it.effects.length ? `  effects ${it.effects.map((e) => e.name).join(", ")}\n` : "";
      for (const ex of it.examples) extra += `  example ${fx(ex.call, 1)} == ${fx(ex.expected, 1)}\n`;
      out += extra ? `${header}\n${extra}${block(it.body, 0)}\n` : `${header} ${block(it.body, 0)}\n`;
    }
  }
  return out + take(Infinity, 0);
}

// ---------------------------------------------------------------- pipeline
function compile(file) {
  const src = fs.readFileSync(file, "utf8");
  const { toks, comments } = lex(src);
  const items = new Parser(toks).program();
  const errors = [...new Checker(items).run(), ...checkEffects(items)];
  return { items, comments, errors };
}
function report(file, errors) {
  for (const e of errors) console.error(JSON.stringify({ file, ...e.toJSON() }));
  return errors.length === 0;
}
function findTsc() {
  if (process.env.HOLV_TSC) return process.env.HOLV_TSC;
  for (let d = process.cwd(); ; d = path.dirname(d)) {
    const p = path.join(d, "node_modules", ".bin", "tsc");
    if (fs.existsSync(p)) return p;
    if (path.dirname(d) === d) break;
  }
  const w = spawnSync("which", ["tsc"], { encoding: "utf8" });
  return w.status === 0 ? w.stdout.trim() : null;
}
function build(file, opts = {}) {
  // --caps takes a file, or a name resolved from caps/<name>/caps.ts (the reviewed wrapper set)
  const capsFile = !opts.caps ? null : /[/.]/.test(opts.caps) ? path.resolve(opts.caps) : path.join(HERE, "caps", opts.caps, "caps.ts");
  if (capsFile && !fs.existsSync(capsFile)) { console.error(JSON.stringify({ file, code: "E062", msg: `no caps file ${capsFile}`, fix: { do: "pass --caps with a path to a .ts file, or the name of a directory under caps/" } })); process.exit(1); }
  const { items, errors } = compile(file);
  if (!report(file, errors)) process.exit(1);
  const name = path.basename(file).replace(/\.holv$/, "");
  const outDir = opts.outDir ?? path.join(path.dirname(file), ".holv-out");
  fs.mkdirSync(outDir, { recursive: true });
  const be = backends[opts.target ?? "ts"];
  if (!be) { console.error(JSON.stringify({ file, code: "E063", msg: `unknown target ${opts.target}`, known: Object.keys(backends), fix: { do: `pass --target with one of: ${Object.keys(backends).join(", ")}` } })); process.exit(1); }
  const files = be.emit(items, name, path.basename(file));
  for (const [f, text] of Object.entries(files)) fs.writeFileSync(path.join(outDir, f), text);
  if (!opts.skipCheck) {
    const r = be.check(outDir, Object.keys(files), capsFile);
    if (r.status === "missing") console.error(JSON.stringify({ file, warn: `${be.checker} not found; independent typecheck skipped`, fix: { do: r.fix } }));
    else if (r.status !== "ok") { console.error(JSON.stringify({ file, code: "E090", msg: `${be.checker} rejected the emitted ${be.name} code; this is a holvc bug, not an error in your program`, [be.checker]: r.output, fix: { do: `do not edit the generated code; open an issue on holv with this .holv file and the ${be.checker} output` } })); process.exit(1); }
  }
  const hasMain = items.some((i) => i.k === "fn" && i.name === "main");
  return { outDir, name, hasMain, capsFile, be };
}

// ---------------------------------------------------------------- backends
// A backend is one object: emit source files, check them with a tool holvc did not write, run them.
// Everything above this line is target-independent; a second backend (#15) is a sibling here.
const tsBackend = {
  name: "TypeScript",
  checker: "tsc",
  emit(items, name, srcName) {
    return { [`${name}.ts`]: emit(items, srcName), "runtime.ts": fs.readFileSync(path.join(HERE, "runtime.ts"), "utf8"), [`${name}.run.ts`]: tsDriver(items, name, srcName) };
  },
  check(outDir, files, capsFile) {
    const tsc = findTsc();
    if (!tsc) return { status: "missing", fix: "run pnpm install in the holv directory, or set HOLV_TSC to a tsc binary" };
    const r = spawnSync(tsc, ["--strict", "--noEmit", "--noUncheckedIndexedAccess", "--allowImportingTsExtensions", "--module", "nodenext", "--target", "es2022", "--skipLibCheck", ...files.filter((f) => f !== "runtime.ts").map((f) => path.join(outDir, f)), ...(capsFile ? [capsFile] : [])], { encoding: "utf8" });
    return r.status === 0 ? { status: "ok" } : { status: "rejected", output: r.stdout.trim() };
  },
  run(outDir, name, args, env = {}) {
    const r = spawnSync(process.execPath, ["--experimental-strip-types", "--no-warnings", path.join(outDir, `${name}.run.ts`), ...args], { stdio: "inherit", env: { ...process.env, ...env } });
    process.exit(r.status ?? 1);
  },
};
const backends = { ts: tsBackend };
function tsDriver(items, name, srcName) {
  const main = items.find((i) => i.k === "fn" && i.name === "main");
  {
    const caps = new Set(items.filter((i) => i.k === "cap").map((i) => i.name));
    let argi = 0;
    const args = (main?.params ?? []).map((p) => {
      if (caps.has(p.type.name)) return `caps.get(${JSON.stringify(p.type.name)}) as prog.${p.type.name}`;
      const i = argi++;
      if (p.type.name === "Int" || p.type.name === "Float") return `Number(args[${i}] ?? (() => { throw new Error("missing argument ${p.name}: ${p.type.name}"); })())`;
      if (p.type.name === "String") return `String(args[${i}] ?? "")`;
      if (p.type.name === "Bool") return `args[${i}] === "true"`;
      throw new HolvError("E060", p.line, p.col, `main parameter ${p.name} must be a cap, Int, Float, String or Bool`, `change the type of ${p.name}: the driver can only supply capabilities and command-line scalars; build the ${p.type.name} inside main`);
    });
    const call = main ? `prog.main(${args.join(", ")})` : `(() => { console.error(JSON.stringify({ file: ${JSON.stringify(srcName)}, code: "E061", msg: "no fn main", fix: { do: "add fn main(...) -> Int; its parameters may be caps and Int, Float, String or Bool" } })); return 1; })()`;
    return `// generated by holvc; do not edit
import { Caps, HoleReached, RuntimeError, runExamples, proc } from "./runtime.ts";
import * as prog from "./${name}.ts";
const argv = proc.argv.slice(2);
const simulate = argv.includes("--simulate");
const args = argv.filter((a) => !a.startsWith("--"));
if (proc.env.HOLV_TEST) proc.exit(runExamples(prog.__examples) ? 0 : 1);
const extra = proc.env.HOLV_CAPS ? (await import(proc.env.HOLV_CAPS)).default : {};
const caps = new Caps(simulate, extra);
try {
  const code = ${call};
  if (simulate) caps.plan();
  proc.exit(code);
} catch (e) {
  if (e instanceof HoleReached) { console.error(JSON.stringify({ hole: e.at, type: e.type, scope: e.scope, fix: { do: \`replace \'hole \${e.type}\' in \${e.at.split(":")[0]} with an expression of type \${e.type}; the scope above is the real data at that point\` } })); proc.exit(3); }
  const err = e instanceof Error ? e : new Error(String(e));
  const fix = e instanceof RuntimeError ? e.fix : { do: "this is a runtime error in program code; reproduce with the same args and HOLV_SEED/HOLV_NOW, then fix the body that raised it" };
  console.error(JSON.stringify({ error: err.name, msg: err.message, fix, ...(proc.env.HOLV_DEBUG ? { stack: err.stack } : {}) }));
  proc.exit(4);
}
`;
  }
}


const [, , cmd, file, ...rawRest] = process.argv;
const flag = (name) => { const i = rawRest.indexOf(name); return i >= 0 ? rawRest[i + 1] : undefined; };
const capsOpt = flag("--caps"), targetOpt = flag("--target");
const rest = rawRest.filter((a, i) => !(["--caps", "--target"].includes(a) || ["--caps", "--target"].includes(rawRest[i - 1])));
const usage = "usage: holvc check|build|run|test|fmt <file.holv> [args] [--caps file.ts] [--target ts] [--simulate] | holvc spec";
try {
  if (cmd === "spec") process.stdout.write(fs.readFileSync(path.join(HERE, "spec.md"), "utf8"));
  else if (!file) { console.error(usage); process.exit(2); }
  else if (cmd === "check") { const { items, errors } = compile(file); if (!report(file, errors)) process.exit(1); console.log(JSON.stringify({ ok: true, file, fns: items.filter((i) => i.k === "fn").length })); }
  else if (cmd === "build") { const b = build(file, { target: targetOpt }); console.log(JSON.stringify({ ok: true, out: b.outDir, target: b.be.name })); }
  else if (cmd === "run") { const b = build(file, { caps: capsOpt, target: targetOpt }); if (!b.hasMain) { console.error(JSON.stringify({ file, code: "E061", msg: "no fn main", fix: { do: "add fn main(...) -> Int; its parameters may be caps and Int, Float, String or Bool" } })); process.exit(1); } b.be.run(b.outDir, b.name, rest, b.capsFile ? { HOLV_CAPS: b.capsFile } : {}); }
  else if (cmd === "test") { const b = build(file, { target: targetOpt }); b.be.run(b.outDir, b.name, [], { HOLV_TEST: "1" }); }
  else if (cmd === "fmt") {
    const { items, comments } = compile(file); // fmt only needs a parse; type errors are reported by check
    const text = format(items, comments);
    if (rest.includes("--write")) fs.writeFileSync(file, text); else process.stdout.write(text);
  }
  else { console.error(usage); process.exit(2); }
} catch (e) {
  if (e instanceof HolvError) { console.error(JSON.stringify({ file, ...e.toJSON() })); process.exit(1); }
  throw e;
}
