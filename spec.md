# holv 0

Language for LLM agents. Compiles to TypeScript. Load this file into context before writing holv.

## File
First line: `holv 0`. Comments: `-- text`, own line only. Extension `.holv`. Run `holvc fmt --write` before every commit.

## Declarations
```
type Post { id: Int, up: Int, created: Int }         -- struct; types start Uppercase
cap Clock { now(): Int }                             -- capability interface; the only way to touch the world
fn score(p: Post, now: Int) -> Float                 -- pure fn: no cap params, no effects line
  example score(Post { id: 1, up: 10, created: 0 }, 7200) == 1.25
{
  let base = toFloat((now - p.created) div 3600 + 2)
  toFloat(p.up) / (base * sqrt(base))                 -- last expression is the return value
}
fn main(clock: Clock, out: Out, n: Int) -> Int        -- effectful fn: cap params listed in effects
  effects Clock, Out
{
  out.print(str(clock.now()))
  0
}
```
Rules: a cap type may appear only as a fn parameter: never a struct field, a `List` element, a cap method parameter or result, or a fn return type (E023). A fn that takes a cap must declare `effects Cap`. A fn that calls an effectful fn must declare its effects too. `main` may take caps and Int/Float/String/Bool; the driver supplies caps, argv supplies the rest.

## Types
`Int` `Float` `String` `Bool` `Unit` `List<T>` and declared types. No null. `Int` is a 53-bit integer (±9007199254740991): an Int literal beyond that is a compile error (E058), an Int result beyond it stops the program (IntOverflow, exit 4); nothing wraps or rounds silently. No implicit conversion: `Int` and `Float` never mix, use `toFloat(i)`. `/` is Float only; Int uses `div` and `mod`.

## Statements
```
let x = expr               -- immutable
var x = 0                  -- mutable; assignment is `x = expr`
let xs: List<Post> = List.new()   -- List.new needs the annotation
for i in 0 .. n { ... }    -- i is Int, end exclusive
```

## Expressions
Literals `1` `1.5` `"s"` `true`. Operators by precedence: `or` `and` `== !=` `< <= > >=` `+ -` `* / div mod`. Unary `-x` `not b`.
`if c { a } else { b }` is an expression; both branches same type. There is no `if` without `else`; an empty block `{ }` is `Unit`, so a statement-if is `if c { ... } else { }`. There is no `while`; loop with `for` or recurse (fns may call themselves).
`Post { id: 1, up: 2, created: 0 }` struct literal, all fields required.
`xs[i]` (out of range stops the program) `xs.len` `xs.push(v)` `xs.sortBy(fn(a, b) { ... })` comparator returns Int.
Builtins: `sqrt(Float) -> Float` `floor(Float) -> Int` `toFloat(Int) -> Float` `str(x) -> String`.
`hole T` compiles and runs; reaching it stops the program with the scope as JSON (exit 3). Runtime errors (index out of range, missing cap) are JSON with `fix.do`, exit 4.
A `fn(a, b) { ... }` literal is only allowed as the argument of `sortBy`.

## Tooling
`holvc check f.holv` types + effects, JSON errors on stderr. `holvc run f.holv args` builds, runs tsc on the output, runs. `--simulate` swaps caps for dry ones and prints the effect log. `--caps file.ts` (or `--caps name` for a reviewed wrapper under `caps/`) adds capability implementations: the file's default export maps cap names to `{ real(): object, dry(): object }`. This is the only way foreign code (npm, anything) enters a holv program; there is no import. `holvc test f.holv` runs examples. `holvc fmt f.holv [--write]` canonical form. `holvc spec` prints this file.
Errors: `{"file","code","line","col","msg",...facts,"fix":{"do":"<what to change>"}}`. `fix.do` is always present. Facts beside `msg` when they exist: `expected`, `got`, `scope` (names in scope), `fields`, `methods`, `known` (types), `missing`, `extra`. Machine edits beside `do` when the fix is mechanical: `replace`/`with`, `fn`/`add_effect`, `insert_line_1`.
