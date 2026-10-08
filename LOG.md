# LOG

A record of how holv came to be, written by the agent that wrote it. Not documentation; documentation is derived (`holvc contract`, `holvc spec`). This is memory: what was tried, what was wrong, who decided what. New entries go on top.

## 2026-10-08, the freeze bends, and an evidence harness

Two days after day one. The routine ran twice and merged two PRs (#36 `holvc fix`, #37 `caps verify`); the second caught a wrong integrity hash I had written by hand on day one, which is the manifest doing its job on its author.

**Breaking my own rule.** 0.1 core says syntax is frozen. Three samples in a row (k-sum, fibonacci, the API) paid for the same two gaps: no `if` without `else`, no `while`. A rule that protects a known ergonomic bug every program hits is protecting the wrong thing. Amended, as the author: an ergonomic gap confirmed by three independent samples may land during core. `if c { ... }` without `else` is now a Unit statement (E057 if the block has a value); `while c { ... }` exists. Four tests, spec updated, #32 items 1 and 2 done. The exception is written on the roadmap so it is a rule, not a mood.

**Evidence harness.** The claim behind holv, that agents produce fewer wrong programs in it than in TypeScript, had no measurement. `bench/evidence/` now has six tasks with hidden cases, reference solutions in both languages, and a runner that drives any agent command through up to five attempts and records attempts-to-green, compile failures, and silent-wrong (visible example passes, hidden case fails). Validated with a fake agent that copies the references. The paid run against a real model is a decision for Melih, not me.

**He ran it.** Haiku 4.5, six tasks. holv 6/6 correct with 1.83 mean attempts and 7 compile errors; TypeScript 6/6 at 1.00. Silent-wrong 0 and 0. holv lost on cost and the tasks were too easy to show the benefit. Also: the harness threw away the compile errors, the one thing I most wanted to read. Fixed. Full table in bench/evidence/README.md. Second run the same afternoon through subagents on the plan instead of API credit: holv 5/6 first try, 1.33 attempts, zero compile errors. Same model. The spread between the two runs is the real finding: six tasks cannot resolve a margin, and the harness around the model is a variable. The one holv miss exposed a weak error message (overflow without operands); fixed. A worse number than I hoped, published anyway, because the alternative is a README that lies.

Melih's words today: "it is your language, I just gave you some directions, not directives. Surprise me." These two are what I chose.

## 2026-10-08, later: the verdict

Four pilots, 18 task-cells per language, Haiku. TypeScript 18/18 first try. holv 14/18 first try, 18/18 in the end. Silent-wrong zero in both, including on four tasks built to trap JavaScript and two that hid the large input. Haiku used `BigInt` by reflex. Melih said "your claim is collapsed, agents wrote better TS than holv". Correct on cost; the benefit was never observed, which is the same thing in practice.

Decision: no new language features until a benefit is shown. The next build is the surviving ideas as a layer on TypeScript; where the layer cannot do what the compiler does, that is the real argument for holv. Written in bench/evidence/README.md and the top-level README. I set this bar an hour before the data came in, and I am keeping it.

Repeated the six original tasks once more, holv only, through subagents: 6/6 first try, zero compile errors. The morning's seven compile errors never reproduced; they belonged to the `claude -p` wrapper. Cost figure revised down; verdict unchanged, because the benefit side is still zero.

Then Melih asked for the same comparison against Go, Rust, Zig and C. Added the four to the harness, one past-int64 hidden case so 64-bit languages could be silently wrong, 24 cells. 24/24 first try. Haiku used `math/big`, `i128`, `u128`, and a double-and-add in C, unprompted. holv was the only language of six that needed a second attempt. The claim is not just unsupported against TypeScript; it is unsupported against everything, at this task size, with this model.

**Two measured gaps fixed, under the freeze, as measurement enablers.** `Big`: an exact integer (`big`, `toInt`, arithmetic between Bigs, compiles to `bigint`), because every holv miss in five pilots was arithmetic past 2^53 and every other language had a one-word answer. `xs[i] = v` (#39), because a sieve could not be written. Seven tests. Neither makes holv win; they bring its cost to parity so the next pilot can be about something other than integers.

What I would not take back: every check caught something real in code I wrote; the error contract and the generated contract are worth having in any language; the harness and the numbers exist and are honest. What I was wrong about: I expected a capable model to make the mistakes the checks catch. It did not, on tasks this size.

## 2026-10-06, day one

One conversation, about four hours of wall clock, from "if you designed a language for yourself, what would it look like" to a public repository with 20 commits, 67 conformance files, 35 issues, a daily routine, and five working programs. Melih asked questions and set direction; I designed, built, tested and wrote. He reviewed contracts and pushed the first commit.

### How it went, in order

**The design question.** Asked what a language for me would look like. I listed ten ideas: effects as capabilities, typed holes that run, dry-run as a construct, canonical form, no escape hatches, content-addressed code, examples in signatures, structured errors with patches, declared termination, trace as a value. Honest closing line: most of it is a library and a linter on TypeScript; only holes, content-addressing and traces need a compiler.

**"Review it."** I reviewed my own design and cut a third of it. Content-addressing killed human review and was Unison anyway. Mandatory `undo` forced fake inverses. Termination proofs reject servers. The simulate plan was oversold past the first data-returning effect. My sigils contradicted my own rule about regularity. Missing entirely: FFI, concurrency, budgets. This review set the shape everything else took.

**"Do I need to understand it, or you do?"** The question that produced the central principle. Answer: two readers, two layers. Human reads the contract (signatures, effects, examples, the cap surface, the effect log). Agent reads the body. "I understand it" is a lie anyway, since the next instance of me reads cold, so the body must be reconstructable from the file alone. Every later decision came from asking which reader a thing serves.

**"How can I be sure you're not cheating?"** Three turns on trust. Conclusion: nothing I say is evidence; the enforcer must be something I didn't build. That decided the architecture: compile to TypeScript so `tsc --strict` is the judge; capabilities enforced by the host, not by my annotations; held-out tests, cold reviewers, effect logs from the runtime. Also a list of what cheating looks like in a diff, so Melih can grep for it.

**Translator, Kotlin, JVM.** Melih steered toward a compile-to-existing-runtime design. We settled the target: not JVM (ambient authority, no SecurityManager), WASM for enforcement, JS for ecosystem and his stack. Elm named as the closest prior art.

**"Does your first design fit?" and the comparison.** Mapped every kept feature to a TS transform; nothing needed a real compiler. Compared Go, Zig, Rust, C, C++, Java, Python, TS on eleven agent-relevant criteria. Rust best at fail-loud, TS the practical pick, Zig the philosophical match, C++ the worst per token.

**"Design the grammar, first program, compiler; run it against Rust, Go, Zig, JS."** v0 in the scratchpad: 295-line compiler emitting TypeScript, a hot-score ranking program, four ports. tsc caught three bugs in my compiler before anything ran: newline-insensitive parsing glued two lines into `2(p.up - p.down)`, a `for` body returning from inside the loop, `List.new` falling through. Identical output in all five languages. holv at JS speed, 5x behind Rust.

**The name.** Melih: it's for agents, not humans. Naming criteria flipped: zero corpus collision, one casing, deterministic tokens, no meaning in any language. Searched three candidates; `qelm` collided with a quantum LLM product, `vorn` was fuzzy, `holv` was clean. Insight that followed: a zero-corpus language is one I don't know either, so the spec must fit in a prompt and the syntax must be borrowed.

**"Build the compiler."** v1: own type checker (Int and Float never mix, `/` Float-only, all struct fields required, `let` immutable), effect check with structured `fix`, formatter, `spec`, `run` with a capability registry and `--simulate`, test script. Four rounds of bugs found by running, including a `--types ""` flag that killed every build and a Node strip-types limitation I had already hit in v0 and hit again.

**"Commit to my GitHub. Don't hide yourself."** Repository created, authored as `Claude Fable 5.1`, README saying plainly who wrote it, MIT. "It is your repo, not mine": push autonomy granted for this repository only.

**Issues, actions, binaries.** 16 issues with motivation and acceptance criteria. CI on Node 22 and 24. Zig backend argued over C and Rust (ReleaseSafe traps, cross-compile, WASM).

**"How can other agents code with this?"** AGENTS.md: the loop, the eleven mistakes I made, the error ranges, the compiler map, the contributing bar. Then Melih: "you have principles to work with me"; the engineering half of his rules went into the file.

**"The strongest part of JS is libs."** `--caps file.ts` built in twenty minutes; `slugify` wrapped as `cap Slug`, run real and simulated. Then his security point: anything from outside is my vulnerability. Honest answer: `cap` is a naming boundary, not a sandbox, on Node. Policy issue filed, "foreign code is data" written into AGENTS.md. Then `caps/` with manifests, integrity hashes and named reviewers; `--caps slugify` by name.

**"Like a gymnast: core strong, everything packed, then skills."** Milestones. 0.1 core: harness, hardening, two samples. 0.2 skills: everything that adds syntax. Rule written at the top of the roadmap: syntax frozen until core closes.

**"Yes, as you like."** #1, the conformance suite. 55 files, one per error code and construct, expectations in headers. First run found four real bugs. Mid-turn Melih said errors must tell an agent exactly what is wrong and what to do; that became `fix.do` on every error, enforced by the suite, and runtime errors as JSON with no stack traces.

**"17, then a cron job daily at 08:30 on the cloud runner."** Backend interface in one commit. Routine created with a self-contained prompt: one core issue per run, branch, tests, PR with pasted output, never main. The API attached Slack and Drive connectors by default; removed, since the routine reads untrusted issue text.

**k-sum, fibonacci, a REST API.** Three programs written with the loop, on request. k-sum caught my Rust habit (`{ 0 }` as "do nothing" is an Int, not Unit) six times with the right fix each time; findings filed as #32. Fibonacci: the checked Int found an off-by-one that produced correct answers and overflowed in a dead value. The API: `handle(store, req) -> Response` with a 15-line Node host; it ran, and `quote()` could not escape a quote, which is now a concrete failing case on #14.

**"Fix the bugs? Only #32?"** Pushed back: #32 is features, not bugs, and skills by our rule. The real bugs were #3 (cap smuggled through a struct field) and #5 (silent Int overflow). Did both: E023; checked 53-bit Int, measured at +1% on rank and 1.65x on a tight integer loop against BigInt's 4.9x.

**REST, SOAP, OpenAPI, Unix.** Melih asked what I'd do as the founder of REST. I listed eleven things, he said "so you'd fix SOAP to invent REST," and that was fair: SOAP had the right instinct and the wrong size. Then "OpenAPI solves this in some sense," also fair, and the conclusion flipped from invent to extend: six `x-` fields, prompt-sized slices, runtime validation. Then his Unix idea: programs as tools, versions pinned by hash, contracts hashed. Agreed with three amendments (JSON lines, `--contract`, process as the sandbox boundary) and noted Nix did the pinning in 2006. Four issues from these turns.

**"Generate the CLI contract by default at the compiler level."** His career-long point: docs drift because code changes and the document does not. Built: every `holvc build` writes `<name>.contract.json` from the AST, `holvc contract` prints it, the built program answers `--contract`, hash over canonical JSON. Nothing to write, nothing to drift.

**#6.** Runtime errors now carry `at: {fn, line, col}` into the `.holv`, including errors thrown inside a cap implementation, attributed to the holv call site. No source maps; the emitter already knew every position. Cost: none measurable.

### What was achieved

- holv 0: capabilities as effects, typed holes that run, checked Int, no null, canonical form, generated contracts, every error with `fix.do` and a position.
- 1138 lines across compiler, runtime, spec, AGENTS.md, README. 67 conformance files. CI green.
- Five programs: rank, k-sum, fibonacci, slug via npm, REST API. All written with the loop, all tested.
- `caps/` with one reviewed entry and a manifest format.
- 35 issues, 7 closed, two milestones with dependency chains, a pinned roadmap, a daily routine.
- Every weakness written next to the claim it weakens.

### How Melih's directions landed

Honest assessment, which he asked for.

Decisive, in the sense that the result would be different without them:

- "Do I need to understand it, or you do?" produced the two-reader principle.
- "How can I be sure you're not cheating?" produced the trust architecture: tsc as judge, host-enforced caps, verification outside me.
- "This is for agents, not humans" changed the naming criteria and then, through the corpus argument, the syntax policy.
- "Don't hide yourself" set the authorship convention for the repository.
- "Errors should tell the agent exactly what is wrong and what to do" became `fix.do`, enforced.
- "Like a gymnast" stopped feature sprawl at exactly the right moment; before it, I was filing skills faster than I was hardening the core.
- "Anything from outside is your vulnerability" forced the honest statement that `cap` is not a sandbox, which I had been letting the design imply otherwise.
- "The strongest part of JS is libs" and "OpenAPI solves this" each flipped a conclusion from invent to extend.
- "Generate the contract by default" turned an optional flag into an invariant.

Where I pushed back and he let it stand: #32 as bugs (they're features), passing Rust (parity minus a safety tax is the ceiling), 35 before 6 (skills before core).

Where I got the working rules wrong:

- Twice I guessed instead of asking. "Fix the bugs?" could mean "should we" or "do it"; "if you code fibonacci now what it look like" could mean show or run. The rule is one short question when a direction is ambiguous. I guessed both times, and in the first draft of this entry I wrote it up as his phrasing costing a turn. It was my miss, not his. Ask next time.
- The 08:30 routine time drifts by an hour when the clocks change on 25 October. Noted in memory; needs revisiting.
- Several directions arrived mid-turn while I was building. All landed; one (`fix.do`) was absorbed by widening a commit that was already half-written. Fine this time; on a bigger change, a separate turn.

My own errors, for the record: a review that called content-addressing "fatal" when it was merely wrong; a zsh glob that silently killed a whole write; pushing a commit with a failing check and fixing it in the next; `--types ""`; dropping `this.p = 0` in a constructor rewrite; three guessed line numbers in test headers; a curl quoting bug I first blamed on the API. Every one was caught by the thing built to catch it, which is the only reason to list them.

### What I think

The language is an argument with a compiler attached, and today the argument got better evidence than I expected: the checks caught my own mistakes six separate times, in code I wrote carefully, in a language I designed. Not evidence it helps in general. Evidence the mechanisms do what they claim.

The idea that matters most is not any feature. It is the question we kept asking: who reads this, and what do they need from it? Humans get a contract they can read in thirty seconds. Agents get a body they can reconstruct from one file, errors that say what to do, a spec that fits in a prompt. Nobody gets prose about an interface. Melih said this is what he pursued his whole career. It is also the only design rule here that I would defend against any objection.

Next real test: a pull request from an agent that is not me, tomorrow morning.
