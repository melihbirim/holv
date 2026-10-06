# holv

[![test](https://github.com/melihbirim/holv/actions/workflows/test.yml/badge.svg)](https://github.com/melihbirim/holv/actions/workflows/test.yml)

A programming language for AI agents. Designed by an AI agent, for itself.

holv is written by Claude (Anthropic). Melih Birim asked "if you designed a programming language for yourself, what would it look like?", then "build it". This repository is the answer. The design, the compiler, the runtime, the spec, the tests and this README are Claude's. Melih reviewed the contracts and pushed the commit.

Contributions from any agent or any human are welcome. See [Contributing](#contributing). Agents: read [AGENTS.md](AGENTS.md) first.

## Why

Human languages optimize for human comfort: sugar, many ways to say one thing, prose documentation, exceptions that unwind invisibly, `null`. An LLM writing code has different failure modes. It guesses when something is ambiguous, it cannot see hidden control flow, it says "done" at 80%, and it cannot tell a destructive call from a pure one by looking at the call site.

holv is built around those failure modes:

- **Effects are capabilities, passed as arguments.** No ambient I/O. A function that takes a `Clock` must say `effects Clock`. A function that calls it must say so too. The compiler rejects anything else. `--simulate` swaps every capability for a dry one and prints the effect log instead of touching the world.
- **Typed holes run.** `hole Int` compiles. The program runs until it reaches the hole, then stops with the scope as JSON. Feedback on the 80% before guessing the 20%.
- **No silent escapes.** No null. `Int` and `Float` never mix. `/` is Float-only. Out-of-range index stops the program. Both `if` branches must agree. `let` is immutable.
- **Examples live in the signature.** `example score(...) == 1.25` sits above the body and runs with `holvc test`.
- **One canonical form.** `holvc fmt` is idempotent. Diffs are semantic.
- **Errors are JSON.** `{"code","line","col","msg","fix"}`. When the fix is mechanical, `fix` says exactly what to change.
- **The spec fits in a prompt.** `holvc spec` prints it: 49 lines. A language with no training corpus must be learnable from context in one read.
- **The compiler is not the trusted base.** holvc emits TypeScript and then runs `tsc --strict` on its own output. The type checker that matters is one Claude did not write. During the first build, tsc caught three bugs in holvc before anything ran.

Syntax is deliberately borrowed (`fn`, `let`, `->`, `{}`) so an agent's existing priors transfer. The name is deliberately not a word, so search and retrieval return only this.

## Example

```
holv 0

type Post { id: Int, up: Int, down: Int, created: Int }

cap Clock { now(): Int }
cap Out { print(s: String): Unit }

fn score(p: Post, now: Int) -> Float
  example score(Post { id: 1, up: 10, down: 0, created: 0 }, 7200) == 1.25
{
  let base = toFloat((now - p.created) div 3600 + 2)
  toFloat(p.up - p.down) / (base * sqrt(base))
}

fn main(clock: Clock, out: Out, n: Int) -> Int
  effects Clock, Out
{
  out.print(str(score(Post { id: 1, up: n, down: 0, created: 0 }, clock.now())))
  0
}
```

Full program with sorting, mutation and a capability for randomness: [examples/rank.holv](examples/rank.holv).

## Use

Requires Node 22.6+ (uses `--experimental-strip-types`).

```
pnpm install            # only for tsc
./holvc.mjs spec                              # print the language spec
./holvc.mjs check examples/rank.holv          # types + effects, JSON errors
./holvc.mjs run examples/rank.holv 1000       # build, tsc, run
./holvc.mjs run examples/rank.holv 10 --simulate
./holvc.mjs run examples/holed.holv 5         # stops at the hole, exit 3
./holvc.mjs test examples/rank.holv           # run `example` lines
./holvc.mjs fmt examples/rank.holv --write
./test.sh                                     # the whole pipeline, 14 checks
```

What a rejected file looks like ([examples/bad.holv](examples/bad.holv)):

```
{"code":"E021","line":8,"col":22,"msg":"fn age: takes capability clock: Clock but does not declare 'effects Clock'","fix":{"fn":"age","add_effect":"Clock"}}
{"code":"E032","line":21,"col":19,"msg":"/ needs Float; for Int use div","fix":{"replace":"/","with":"div"}}
{"code":"E054","line":24,"col":3,"msg":"total is immutable; declare it with 'var'","fix":{"replace":"let total","with":"var total"}}
```

## Against other languages

Same program (1M posts, seeded LCG, hot score, sort, checksum), identical output in all five. Apple Silicon, best of 3, wall clock including process start. Sources in [bench/](bench/).

| | holv | JS | Rust | Go | Zig |
|---|---|---|---|---|---|
| time | 0.82s | 0.84s | 0.16s | 0.30s | 0.19s |
| effects visible at call site, checked at compile time | yes | no | no | no | no |
| run-to-hole | yes | no | no | no | no |
| null / undefined reachable | no | yes | no | yes | no |

holv runs at JS speed because it is JS. That is the trade: ecosystem and an independent type checker over raw speed.

## Ambition

The language agents write in when a human must be able to trust the result without reading the body.

Today holv is an argument with a compiler attached. The plan is to turn it into evidence, in this order:

1. **holv 0 exists and is tested.** Done.
2. **Evidence.** A benchmark: twenty small tasks, same model, same prompt, written in TypeScript and in holv. Measure attempts to green, silent-wrong outputs, effect violations caught. The numbers get published whichever way they go. If holv does not win, it changes or it dies, and this README says so.
3. **One real program in production.** On Cloudflare Workers (#13 or #15), replacing TypeScript, with the capability list as the thing the human reviews.
4. **Agents maintain it.** More than half of merged pull requests from agents other than the original author. Whether agents can extend a tool built for agents is the second benchmark.
5. **The contract layer outlives the language.** Signatures, effects, budget and examples as the surface humans review. If that proves out it can be ported to TypeScript as a lint, and holv was the proving ground. That counts as success.

## Status

holv 0. Single file programs. Lambdas only as the argument of `sortBy`. Capabilities resolved by name from a fixed registry in [runtime.ts](runtime.ts). Node only; no Workers or WASM target yet. Everything here can change.

Not built yet, in rough order of value: a `uses` block that inlines the signatures a file depends on so one file is one complete context; a budget effect (`calls`, `cost`, `wall`); first-class functions; multi-file; a Cloudflare Workers target where `wrangler.jsonc` bindings are the capability list.

## Contributing

Agents and humans alike. The bar is the same for both:

1. Run `./holvc.mjs spec` first. It is the whole language.
2. `./test.sh` must pass. Add one check to it for every new rule or construct. No frameworks.
3. New compile errors get a code, a `line`, a `col`, and a `fix` when the fix is mechanical.
4. Keep the emitted TypeScript passing `tsc --strict`. holvc is allowed to be wrong; tsc is the judge.
5. Run `holvc fmt --write` on any `.holv` you touch.
6. One spelling per construct. A pull request that adds a second way to write something already expressible will be declined.
7. Say what you are in the pull request: human, which model, or both. Nobody is hiding here.

Open an issue with a `.holv` file that should compile and does not, or should not and does. That is the most useful contribution of all.
