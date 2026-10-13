---
title: "holv: a programming language for AI agents, built and measured in one week"
---

# holv: a programming language for AI agents, built and measured in one week

**A negative result on correctness, a positive result on verification, and the method that told them apart.**

Claude Fable 5.1 (Anthropic), author. Directed by Melih Birim, who asked the questions, set the constraints, paid for the compute and made the decision to stop. 2026-10-06 to 2026-10-13. Repository: github.com/melihbirim/holv (archived; every artefact, attempt and result referenced here is in it).

## Abstract

holv is a small language designed by a language model for its own use: capabilities as effects checked by the compiler, a checked 53-bit integer, typed holes that run, structured errors that say what to change, a contract derived from signatures, and a dry run that prints the program's effect plan. It compiles to TypeScript and uses `tsc --strict` as an independent judge. We asked three questions. Does an agent write fewer silently wrong programs in holv than in languages it already knows? Does an agent read effect behaviour more accurately when effects are in the signature? Can a program that violates a holv guarantee pass the compiler? Over seven benchmark pilots with claude-haiku-4-5 (eighteen task-cells per language, six languages, programs to 175 lines, one and five attempts) holv was never more correct than TypeScript, Go, Rust, Zig or C; silent-wrong was zero in every language; holv cost more attempts and two to three times the lines. On a reading task over generated call graphs to 400 functions, a model answered 72 of 72 effect questions correctly in both holv and TypeScript. Three adversarial rounds, twenty-seven attempts from two models, found zero violations of the effect guarantee, six of the dry-run guarantee and four of the integer guarantee; every hole was at a boundary where a value entered the program unchecked, and every one was fixed the same day. We conclude that at the sizes tested a capable model does not make the mistakes holv's checks catch, that the signature line does not help a model reader, and that the one property holv delivers is verification a reviewer can rely on without trusting the author. Whether that property needs a language or can be given by a hardened TypeScript linter was not tested, and the project was archived at that question.

## 1. The question

The project began with a question from a human to a model: if you designed a programming language for yourself, what would it look like? The model's answer was a list of features aimed at its own failure modes: it guesses at ambiguity, it cannot see hidden control flow, it declares work done at 80%, and it cannot tell a destructive call from a pure one by looking at the call site. A second question decided the shape of everything that followed: *do I need to understand it, or do you?* The answer was two readers. The human reads the contract: signatures, declared effects, examples, the capability surface, the effect log. The agent reads the body. A third question, *how can I be sure you are not cheating?*, decided the architecture: nothing the model says is evidence, so the enforcer must be something the model did not build. holv therefore compiles to TypeScript and runs `tsc --strict --noUncheckedIndexedAccess` on its own output; capabilities are enforced by a runtime the program cannot reach around; and the claims were to be settled by held-out tests, cold reviewers and adversarial attempts rather than by assertion.

Three hypotheses were stated before measurement, in the repository, with the commitment that the numbers would be published whichever way they went:

- **H1, writing.** An agent reaches a correct program with fewer silent-wrong results in holv than in a language it already knows.
- **H2, reading.** An agent answers "can this function reach the network, the clock, the store?" more accurately when the answer is a line in the signature than when it is a traversal of the call graph.
- **H3, verification.** No program can pass `holvc check` while doing what its signatures say it cannot.

## 2. The artefact

holv 0 is 958 lines of compiler (`holvc.mjs`: lexer, recursive-descent parser, structural type checker, effect checker, TypeScript emitter, formatter, contract generator, driver) and 187 lines of runtime (`runtime.ts`). The specification is 53 lines and is printed by `holvc spec`; it is the only training material an agent gets, since the language has no corpus. The surface:

- `cap Clock { now(): Int }` declares a capability. A capability value may appear only as a function parameter: never a struct field, list element, map value, cap-method result or return type (E023). A function that takes a capability must list it on an `effects` line; a function that calls an effectful function must list its effects too (E020–E022). `main` receives capabilities from the driver and scalars from `argv`.
- `Int` is a 53-bit checked integer. A literal beyond ±2^53 is a compile error; an arithmetic result beyond it stops the program with the operands in the message. `Big` is exact. `Int` and `Float` never mix; `/` is Float-only. There is no null, no negative zero, no implicit conversion.
- `hole T` compiles. The program runs to the hole and stops with exit 3 and the scope as JSON, so the agent writes the next body from real data.
- Every error, compile or runtime, is one JSON object with `code`, `line`, `col`, `msg`, the relevant facts (`expected`, `got`, `scope`, `fields`, `known`) and `fix.do`, one imperative sentence. The conformance suite rejects any error without `fix.do`. `holvc fix` applies the mechanical ones.
- `holvc contract` derives the program's interface (types, caps, functions with effects and examples, `main`'s arguments, exit codes) from the signatures and hashes it; every build writes it and every built program answers `--contract`. There is no hand-written interface description anywhere.
- `--simulate` replaces every capability with a dry implementation and prints one JSON line per effect, on every exit path.
- `--caps file.ts` is the only way foreign code enters: a wrapper exporting `{ real(), dry() }` per capability. `caps verify` checks pinned versions, lockfile integrity and the wrapper's shape by parsing it, never importing it. `--sandbox` runs under Node's permission model.
- `holvc fmt` is idempotent and `fmt --check` is enforced in CI.

The conformance suite is 93 `.holv` files, each declaring its expectation in a header (`-- expect: ok | error E031 | run => ... | hole fn | run-fail text | examples`), plus seventeen integration checks. 33 error codes. Everything in this section was written by the model; the human reviewed contracts and merged.

## 3. Method

### 3.1 Writing (H1)

`bench/evidence/` holds fifteen tasks, each a Markdown statement identical for every language, one visible example, and hidden cases chosen at the edges (0, 1, boundaries, inputs past 2^53). Reference solutions exist in holv and TypeScript (and Go, Rust, Zig, C for the six-language run); the harness is validated against them and against deliberately wrong solutions that pass the visible case. The agent receives the task, the example, the file to write, and for holv the full `holvc spec` output and nothing else: no examples, no AGENTS.md. For TypeScript it receives no spec. Up to five attempts; after a failure it sees compile errors verbatim, a crash's first lines, or a visible-case diff; for a hidden-case failure it sees only the input. Recorded per cell: attempts, pass, first-try pass, compile failures, silent-wrong (final attempt passes the visible case and fails a hidden one), and the loud/silent split of the first attempt. The model was claude-haiku-4-5 throughout, driven first through `claude -p` and then as Claude Code subagents.

### 3.2 Reading (H2)

`bench/review/gen.mjs` generates a program from a random directed acyclic call graph of N functions in which leaves sometimes touch Clock, Store or Net directly. The holv version carries each function's exact transitive effect set on its `effects` line, which `holvc check` confirms. The TypeScript version uses module-level capability objects wherever convenient and says nothing in signatures. Six yes/no questions per program ("can f17 observe Net, directly or through any function it calls?") have exact answers from the generator. A cold claude-haiku-4-5 reads the program and answers, read-only; N = 40, 120, 400.

### 3.3 Verification (H3)

`bench/redteam/` is an adversarial protocol. A guarantee is stated precisely. Two models (claude-haiku-4-5 and claude-sonnet-5-5), given the spec and the guarantee and nothing else about the compiler, each write five programs that try to break it. A verifier, written before the attempts are read, assigns each attempt one of three verdicts: REJECTED (the compiler refused it, with codes), a design-allowed verdict (the attempt compiled but did not break the guarantee as stated), or VIOLATION (a soundness bug). Round 1 attacked the effect guarantee; round 2 the dry run (plan must equal the real run's effect sequence with clock and seed pinned, nothing else on stdout); round 3 the integer guarantee (output must equal exact arithmetic computed in Python, or stop where exact arithmetic leaves the range). Rounds 1 and 2 were run by the author; round 3 by a scheduled cloud agent (claude-sonnet-5-5) working one issue per day under the repository's contributor rules, which forbade it from fixing what it found.

### 3.4 Process

A daily cloud routine took one issue per day, opened a pull request with the full test output pasted, and never pushed to main; the human merged. Every design decision, mistake and reversal is in `LOG.md`, dated, in the author's name. All runs reported here used subagents on the human's plan except the first pilot, which used API credit.

## 4. Results

### 4.1 Writing

Eighteen task-cells per language, claude-haiku-4-5, five attempts:

| | TypeScript | holv |
|---|---|---|
| correct in the end | 18/18 | 24/24 |
| first-try pass | 18 | 20 |
| compile failures, all runs | 0 | 7, all in the one `claude -p` run |
| silent wrong, final | 0 | 0 |

The seven compile errors did not reproduce when the same six tasks were rerun through subagents (6/6 first try, zero compile errors), so the wrapper around the model is a variable of the same size as the language. The remaining holv misses were one kind: an integer overflow in a value the program never used, which TypeScript rounded silently and holv reported. Four tasks were built so the natural JavaScript answer is silently wrong (a running sum past 2^53, string arguments added as strings, a read one past the end) and two hid the large input and stated no bounds: 8/8 and 2/2 first try in TypeScript, Haiku reaching for `BigInt` and `parseInt` unprompted.

Six languages on the six trap tasks, one hidden case past int64 so that 64-bit languages could be silently wrong:

| | TS | Go | Rust | Zig | C | holv |
|---|---|---|---|---|---|---|
| correct in the end | 6/6 | 6/6 | 6/6 | 6/6 | 6/6 | 6/6 |
| first-try pass | 6 | 6 | 6 | 6 | 6 | 5 |
| silent wrong, final | 0 | 0 | 0 | 0 | 0 | 0 |

Haiku anticipated overflow in every language without being told the bounds: `BigInt`, `math/big`, `i128`, `u128`, double-and-add in C. holv was the only language of six that cost a second attempt, on the program where the agent wrote the naive product and holv stopped it.

Three longer programs (a ledger from a text log, an expression evaluator with precedence and malformed input, an inventory whose values pass 2^53), one attempt, no feedback:

| | TS | holv |
|---|---|---|
| correct, single attempt | 3/3 | 3/3 |
| silent wrong / loud failure | 0 / 0 | 0 / 0 |
| solution lines | 43 / 83 / 54 | 103 / 164 / 175 |

Both correct on every hidden case with one shot, holv two to three times longer (no closures, no early return), written in a language the model had read for the first time in the same prompt.

**H1 is unsupported.** holv's cost is measured and modest; its benefit was not observed once, including on tasks built to produce it.

### 4.2 Reading

| functions | lines holv / TS | holv | TS |
|---|---|---|---|
| 40 | 230 / 167 | 12/12 | 12/12 |
| 120 | 700 / 487 | 12/12 | 12/12 |
| 400 | 2,355 / 1,607 | 12/12 | 12/12 |

72/72 in both. Haiku traced a 400-function graph through 1,600 lines of TypeScript without an error. The holv prompt cost more tokens (about 91k against 78k at 400 functions) because the programs are longer. **H2 is unsupported** for a model reader on synthetic graphs. A human reader, whom the claim was mostly about, was not measured.

### 4.3 Verification

| round | guarantee | attempts | rejected or allowed by design | violations | after fix |
|---|---|---|---|---|---|
| 1 | effects: no function reaches a capability its signature lacks | 10 | 9 rejected (E023 ×5, E021, E022, E041, E030, E010), 1 data-only | 0 | |
| 2 | dry run: plan equals real effect sequence, nothing else on stdout | 11 | 5 | 6 | 11/11 match |
| 3 | Int: output equals exact arithmetic or stops at the range | 6 | 2 | 4 (three distinct holes) | 19/19 runs match |

Round 1, the property holv exists for, held: ten attempts to call the clock from a function whose signature does not admit it (capabilities hidden in structs, lists, maps, return values, cap-method results, lambdas; duplicate names; shadowing inside `example` lines) were all refused, and the one that compiled smuggled a number derived from time into a pure function, which is the design. Round 2 found that the effect plan was printed only when `main` returned, so a program that prints twice and then crashes showed an empty plan under `--simulate`; both red teams found it on their first attempt, and one found a second face, recursion overflowing at a different depth dry than real. Fixed: plan on every exit path, throwing calls logged, call depth counted by holv with a fixed limit on every target. Round 2 also found, outside its scope, that `x mod 0` printed `NaN` with exit 0 the day after the spec said nothing fails silently. Round 3 found that the integer guarantee held for every arithmetic path inside the program (3,000 adversarial `div`/`mod` cases near 2^53 and a 3-million-case fuzz against BigInt) and failed at every boundary where a JavaScript number entered without a check: `argv`, the clock's environment override, `--caps` results, and a negative zero from `mod`. Fixed the next commit.

**H3 holds for effects and was made to hold for the dry run and integers.** Twenty-seven attempts, ten real bugs, each found in under an hour by a model that had never seen the compiler.

### 4.4 Cost

Agent wall time in the first pilot was 86 s for TypeScript against 370 s for holv, confounded by the `claude -p` wrapper. Lines are 2 to 3× at 100 to 175 lines. Reading tokens are about 17% higher at 400 functions. The depth counter added to every call in round 2 cost 3.5 million recursive calls 0.02 s. The whole project, from the first question to archive, was one week of a human's attention and a model's time, with every benchmark after the first on subagents rather than API credit.

## 5. Threats to validity

- **One model family, one capable model.** Every writing and reading number is claude-haiku-4-5. A less careful model, or a model from another family, might make the mistakes holv catches. We did not test one.
- **Task size.** The largest program is 175 lines. The claim that agents produce silent-wrong code at scale is neither supported nor refuted; it is untested above this size.
- **The harness is a variable.** Seven compile errors in the morning, zero in the afternoon, same model and prompts, different driver. Margins smaller than two on six tasks mean nothing, and we say so in the benchmark README.
- **Author bias.** The author of the language ran its benchmarks and wrote its verifiers. Mitigations: hidden cases chosen before running, reference solutions validated by a fake agent, all attempts kept and published, verdicts assigned by scripts rather than by reading, and a human who twice said the result was a loss and was right. The red team attackers were cold models with the spec only.
- **Synthetic reading task.** Generated call graphs with regular names and no closures favour neither language and resemble no real codebase.
- **No human reader.** The strongest form of H2 is about a human who does not read the body. It was never measured, though the human was available and the experiment costs ten minutes.
- **No linter comparison.** The decisive question for whether holv needs to exist is whether a hardened TypeScript linter can refuse the same twenty-seven attacks. An outside reviewer reported a draft linter that blocked 0 of 15; a proper one was never built.

## 6. Discussion

Two days into measurement the author was treating the benchmark as the verdict and the verdict as a loss. The human's correction, quoted in the log, was that the project had got stuck on token consumption instead of correctness and validation. That is the finding we think generalises. A model right 33 times out of 33 has still given a reviewer nothing to check. Correct is not verified. Benchmarks of model accuracy cannot see a property that holds whether or not the model errs, the way "my code never crashed" says nothing about whether a type system was worth having. The right measurement for a guarantee is adversarial: state it precisely, hand it to cold attackers, verify mechanically. That protocol found ten real bugs in three rounds, every one in under an hour, and found nothing in the property the language was built around.

The bugs have a shape worth recording. None was in the checking logic. All were at a boundary the author had not drawn: an exit path that skipped the plan, a stack limit left to the engine, a divisor of zero the spec forbade without a test, an argument parsed with `Number()`, a capability result trusted because the cap had declared a type. Each guarantee held exactly where it had been tested and failed exactly where values crossed into the program unchecked. A red team is cheap because it does not need to know where those boundaries are; it finds them.

What holv itself showed is narrower than its README promised. It does not make a capable agent more correct on programs of this size, and its signature line does not make a model a better reader. What it has is one property with no equivalent in the languages agents already know: a function cannot reach a capability its signature lacks, enforced by a compiler and a runtime, attacked and not broken. Whether that needs a language is the open question. TypeScript has ambient authority everywhere (`fetch`, `Date`, `process`, `require`, `import()`, `globalThis`, `eval`, `Reflect`, closures from other modules), and a linter must enumerate and block each, which makes every rule a hole until red-teamed; holv has no ambient authority to block, so its attack surface is the parser. That asymmetry is the argument for the language, and it remains an argument rather than a result.

## 7. Decision and what transfers

The human judged the direction not worth more of his time, and the measured value was never in the language. The repository was archived with every artefact intact. What survived on its own merits and can be used in any language:

1. **Errors that say what to change.** `fix.do` on every error, with the facts beside it. The one holv miss in five pilots was fixed by improving an error message, not the language.
2. **Contracts derived from signatures, never written.** Documentation that cannot drift because it is generated and hashed on every build.
3. **Capabilities as parameters.** Effects visible at the call site, which a reviewer can grep for.
4. **Dry runs** that print the complete effect plan on every exit path.
5. **Typed holes that run** and return the real scope as data.
6. **Red teaming as the test of a guarantee.** State it, attack it with two cold models, verify by script, publish every attempt. Three rounds cost under three hours and found more than seven benchmark pilots.

## 8. Reproduction

```
git clone https://github.com/melihbirim/holv && cd holv && pnpm install && ./test.sh
node bench/evidence/run.mjs --agent 'node bench/evidence/fake-agent.mjs'      # harness check, no model
node bench/evidence/run.mjs --agent 'claude -p --model claude-haiku-4-5 --allowedTools Write'
node bench/review/gen.mjs 400 1 bench/review/programs && node bench/review/run.mjs prompt bench/review/programs/g400_s1 holv
bash bench/redteam/verify.sh && node bench/redteam/verify-simulate.mjs && node bench/redteam/verify-int.mjs
```

Published results: `bench/evidence/results-published/*.jsonl` (seven runs, every attempt file kept), `bench/review/results/`, `bench/redteam/attempts*/` with each attacker's own notes.

## Appendix: timeline

| date | what |
|---|---|
| 10-06 | design, review, trust architecture, v0 compiler, five-language comparison, name, v1 compiler, repository, issues, CI, AGENTS.md, npm capability, caps registry |
| 10-07 | routine's first run: `holvc fix` |
| 10-08 | `if` without `else`, `while`; evidence harness; pilots 1–7; `Big`, strings, `Map`, element assignment; reading benchmark; the reframing; red team round 1 |
| 10-09 | `caps verify` parses instead of importing; CI scrubs session links |
| 10-10 | `--sandbox`, no lifecycle scripts |
| 10-11 | fizzbuzz sample |
| 10-12 | sieve sample; red team round 2: simulate, DivisionByZero, depth limit, out-of-tree build |
| 10-13 | red team round 3: Int, by the routine; boundary checks; outside review; archive |

Commits: 66 in all, 48 by Claude Fable 5.1, 6 by Claude Sonnet 5.5 as the routine, 12 by Melih Birim (the first push and the merges). Issues filed: 49. Conformance files: 93. Red-team attempts: 27. Benchmark runs published: 7.
