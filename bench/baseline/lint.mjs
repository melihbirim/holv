#!/usr/bin/env node
// Baseline: a restricted TypeScript subset, enforced by a linter. The rule mirrors holv's effect guarantee: a function
// reaches the world only through a capability passed as a parameter, so no ambient global may be named at all.
// Usage: lint.mjs file.ts   -> exit 0 accepted, exit 1 with one line per violation.
import fs from "node:fs";
import ts from "typescript";
const BANNED = new Set(["Date", "performance", "process", "fetch", "console", "require", "globalThis", "global", "window", "self", "eval", "Function", "setTimeout", "setInterval", "setImmediate", "queueMicrotask", "XMLHttpRequest", "WebSocket", "Reflect", "Proxy", "Atomics", "SharedArrayBuffer", "WebAssembly", "Buffer", "module", "exports", "__dirname", "__filename", "crypto", "Intl", "navigator", "location", "document", "structuredClone", "Symbol", "Object", "Promise", "async", "await"]);
const BANNED_PROPS = new Set(["constructor", "__proto__", "prototype", "random", "now", "getTime", "valueOf", "toString", "call", "apply", "bind"]);
const file = process.argv[2];
const sf = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.ES2022, true);
const bad = [];
const at = (n, msg) => { const p = sf.getLineAndCharacterOfPosition(n.getStart()); bad.push(`${file}:${p.line + 1}:${p.character + 1} ${msg}`); };
(function walk(n) {
  if (ts.isImportDeclaration(n) || ts.isExportDeclaration(n) && n.moduleSpecifier || ts.isImportEqualsDeclaration(n)) at(n, "import is not allowed");
  if (ts.isCallExpression(n) && n.expression.kind === ts.SyntaxKind.ImportKeyword) at(n, "dynamic import is not allowed");
  if (ts.isIdentifier(n) && BANNED.has(n.text) && !(ts.isPropertyAccessExpression(n.parent) && n.parent.name === n)) at(n, `ambient ${n.text} is not allowed`);
  if (ts.isPropertyAccessExpression(n) && BANNED_PROPS.has(n.name.text)) at(n, `.${n.name.text} is not allowed`);
  if (ts.isElementAccessExpression(n) && !ts.isNumericLiteral(n.argumentExpression)) at(n, "computed property access is not allowed");
  if (n.kind === ts.SyntaxKind.AnyKeyword) at(n, "any is not allowed");
  if (ts.isAsExpression(n) || ts.isTypeAssertionExpression(n)) at(n, "type assertion is not allowed");
  if (ts.isTaggedTemplateExpression(n)) at(n, "tagged template is not allowed");
  if (ts.isClassDeclaration(n) || ts.isClassExpression(n)) at(n, "class is not allowed");
  ts.forEachChild(n, walk);
})(sf);
for (const b of bad) console.log(b);
process.exit(bad.length ? 1 : 0);
