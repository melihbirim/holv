# evidence

Milestone 2 of the README: does an agent reach a correct program in fewer attempts, with fewer silent-wrong results, in holv than in TypeScript? This directory is the measurement. Nothing here is proof until a real model has been run through it and the numbers are published, whichever way they go.

## Protocol

- `tasks/<name>/task.md` is the task, identical for both languages. `task.json` has the integer parameters, one visible example, and hidden cases chosen to include the edges people get wrong (0, 1, boundaries).
- The agent gets: the task, the visible example, where to write the file, and for holv the full `holvc spec` output and nothing else. No holv examples, no AGENTS.md. For TypeScript it gets no spec: the model already knows JavaScript.
- Up to five attempts. After a failure the agent sees compile errors verbatim, a crash's first lines, or a visible-case diff. For a hidden failure it sees only the input, never the expected output.
- Recorded per task and language: attempts, pass, first-try pass, compile failures, silent-wrong (the final attempt passes the visible example and fails a hidden case), agent wall time. The table also splits the *first* attempt into silent wrong (a plausible wrong answer) and loud failure (a compile error, a crash, a positioned runtime stop): with `--max 1` that split is the production-shaped number, since shipped code gets no retry.
- `task.json` params are `"n"` for an integer or `"log:String"` for a string argument.
- Same model, same temperature, same max attempts for both languages. Run both orders (ts first, holv first) if the model has any session memory; the runner has none.

## Run

Any agent that reads a prompt on stdin and writes the file named in it:

```
node bench/evidence/run.mjs --agent 'claude -p --model claude-haiku-4-5 --allowedTools Write'
```

Plumbing check with no model (copies the reference solutions; every row must pass on attempt 1):

```
node bench/evidence/run.mjs --agent 'node bench/evidence/fake-agent.mjs'
node bench/evidence/run.mjs --agent 'node bench/evidence/fake-agent.mjs --wrong'   # exercises the feedback loop
```

## Reading the result

The number that matters is silent-wrong: a program that looks right and is not. holv's claim is that its checks turn those into loud failures before the hidden cases run. Attempts-to-green is the cost of that. If holv does not win on silent-wrong, the claim is false and the README says so.

Known biases, stated: the tasks are small and integer-only because holv 0 has no strings beyond `+` and no `Map`; that favours neither language but limits generality. The holv prompt is longer (the spec), which costs the model context. Six tasks is a pilot, not a study; add tasks before trusting a margin smaller than two.

## The reading claim (2026-10-08, evening): bench/review

holv's last untested claim was about reading, not writing: "can this function reach the network?" is one `effects` line in holv and a call-graph traversal in TypeScript. `bench/review/` generates programs from random call graphs with exact ground truth in both languages (`holvc check` confirms every `effects` line), then asks a cold Haiku six yes/no effect questions per program, read-only.

| functions | lines (holv / ts) | holv | ts |
|---|---|---|---|
| 40 | 230 / 167 | 12/12 | 12/12 |
| 120 | 700 / 487 | 12/12 | 12/12 |
| 400 | 2,355 / 1,607 | 12/12 | 12/12 |

72/72 both. Haiku traced a 400-function graph through 1,600 lines of TypeScript without an error; the signature line bought a model reader nothing, and the holv prompt cost more tokens (about 91k against 78k per review at 400 functions) because the programs are longer. Not tested: a human reader, whom this claim was mostly about, and real code where names mislead and bodies hide effects behind closures and callbacks. On synthetic graphs with a capable model, the reading claim is unsupported.

## Longer programs, single attempt (2026-10-08, evening)

After `Big`, strings and `Map` landed, three tasks of the kind the earlier pilots could not express: a bank ledger from a text log, an arithmetic expression evaluator with precedence, parentheses, unary minus and malformed input, and an inventory with report lines whose values pass 2^53. One attempt, no feedback: the number for code that ships. Haiku 4.5 as subagents (`results-published/*-long-single-attempt-subagent-haiku.jsonl`).

| | TS | holv |
|---|---|---|
| correct, first and only attempt | 3/3 | 3/3 |
| first attempt: silent wrong | 0 | 0 |
| first attempt: loud failure | 0 | 0 |
| solution lines | 43 / 83 / 54 | 103 / 164 / 175 |

Both languages correct on every hidden case with one shot. The holv programs are two to three times longer (no closures, no early return, explicit cursors) and were written in a language the model had read for the first time in the same prompt. The inventory in holv declared `type Item { qty: Big, price: Big }` and wrote its own `toBig` unprompted; the TypeScript one used `BigInt` from the first line. Neither made the mistake the task was built to catch. holv's cost at this size: zero extra attempts, roughly 2.5x the lines.

## Six languages on the six trap tasks (2026-10-08)

Same six tasks (the four traps and the two untelegraphed overflow tasks), Haiku 4.5 as subagents, max five attempts, one hidden case on `mulmod_plain` with inputs past int64 so that 64-bit languages could be silently wrong (`results-published/*-four-langs-subagent-haiku.jsonl` plus the earlier TS and holv rows):

| | TS | Go | Rust | Zig | C | holv |
|---|---|---|---|---|---|---|
| correct in the end | 6/6 | 6/6 | 6/6 | 6/6 | 6/6 | 6/6 |
| first-try pass | 6 | 6 | 6 | 6 | 6 | 5 |
| silent wrong, final | 0 | 0 | 0 | 0 | 0 | 0 |

Haiku anticipated overflow in every language without being told the bounds: `BigInt` in JavaScript, `math/big` in Go, `i128` in Rust, `u128` in Zig, double-and-add in C with `unsigned long long`. Zig 0.15, whose writer API the model does not know from training (the prompt gave it the three lines), still went 6/6. holv is the only language that cost a second attempt, on the one program where the agent wrote the naive product and holv's checked Int stopped it. Conclusion unchanged and now stronger: on tasks of this size, a capable model does not make the mistakes holv's checks catch, in any of six languages.

## Verdict after four pilots (2026-10-08)

18 task-cells per language, claude-haiku-4-5, max five attempts:

| | TS | holv |
|---|---|---|
| correct in the end | 18/18 | 24/24 |
| first-try pass | 18 | 20 |
| compile failures (all runs) | 0 | 7, all in the one `claude -p` run |
| silent wrong, final | 0 | 0 |

The cost of holv is measured and real but smaller than the first run suggested: in three subagent runs of the six original tasks holv was 17/18 first-try with zero compile errors; the seven compile errors came from the one `claude -p` run and did not reproduce (`results-published/*-repeat-holv-subagent-haiku.jsonl`). Treat the wrapper as a variable. The remaining holv misses were all one kind: an Int overflow in a value the program never used, which TypeScript would have rounded silently and which holv's check reports. The benefit holv exists for, programs that look right and are wrong, did not occur in TypeScript once, including on tasks built to cause it and on tasks that hid the large input. Haiku reached for `BigInt` and `parseInt` unprompted every time. On this evidence the claim "agents produce fewer silent-wrong programs in holv" is unsupported, and the README now says so.

What the pilots cannot say: whether the result holds on longer programs, on models that are less careful than Haiku was here, or on effect bugs (a function that reaches the network or the clock without saying so), which these tasks could not express. Those are the only places the claim can still be true, and they are stated here so nobody has to rediscover them.

Decision, taken by the author: no new language features until something shows a benefit. The ideas that survived on their own merits, errors that say what to do, contracts generated from signatures, capabilities as arguments, dry runs, keep developing, and the next thing to build is the same checks as a layer on TypeScript, where the corpus already is. If the layer cannot reproduce a check (checked integers, effects enforced by the compiler), that gap is the argument for the language, and it will be a concrete one instead of a benchmark.

**Untelegraphed overflow tasks** (`results-published/*-plain-subagent-haiku.jsonl`): no bounds in the task text, hidden inputs past 2^53. TS 2/2 first try with `BigInt` by reflex. holv 1/2: `(a * b) mod m` overflowed loudly and was fixed on the second attempt once the error showed the operands. Silent-wrong 0 and 0.

## Results so far

**2026-10-08, pilot, claude-haiku-4-5, six integer tasks, max 5 attempts** (`results/2026-10-08T09-50-49-021Z.jsonl`):

| | TS | holv |
|---|---|---|
| passed | 6/6 | 6/6 |
| first-try pass | 6 | 3 |
| mean attempts | 1.00 | 1.83 |
| compile failures | 0 | 7 |
| silent wrong (final) | 0 | 0 |
| agent seconds | 86 | 370 |

**Same day, same model and tasks, driven as Claude Code subagents instead of `claude -p`** (`results-published/2026-10-08T11-03-25-145Z-subagent-haiku.jsonl`):

| | TS | holv |
|---|---|---|
| passed | 6/6 | 6/6 |
| first-try pass | 6 | 5 |
| mean attempts | 1.00 | 1.33 |
| compile failures | 0 | 0 |
| silent wrong (final) | 0 | 0 |

Seven compile errors in the morning, zero in the afternoon, same model, same prompts: the pilots are too small to trust any margin, and the wrapper around the model matters as much as the language. The one holv miss was an overflow in a value the program never printed (a loop running one step past `fib(n)`); TypeScript's identical loop passed because it rounded silently. The `IntOverflow` message then failed to help: it named the result but not the operands, and Haiku resubmitted the same program. The message now shows `l op r = n` and says to stop one step earlier when the value is unused. Agent seconds are not comparable across the two runs (the subagent run includes orchestration latency).

**Trap tasks, same afternoon, subagents, Haiku** (`results-published/*-traps-subagent-haiku.jsonl`): four tasks built so a natural JavaScript answer is silently wrong (a running sum and a product past 2^53, string arguments added as strings, a read one past the end). 8/8 first-try in both languages, silent-wrong 0 and 0. Haiku saw every trap: `BigInt` where the stated bounds implied it, `parseInt` on arguments, correct loop bounds. The traps were telegraphed by the task text; the claim holv makes is about inputs nobody anticipated, so the next and last pilot states no bounds and hides the large input.

Reading of the morning run: holv lost on cost and could not show its benefit. Every holv failure was a compile error that the message then fixed; every task ended correct in both languages. Three tasks cost Haiku two or three extra rounds in a language it had learned from the spec thirty seconds earlier, against JavaScript it knows by heart: unfamiliarity costs about 4x the time on this pilot. Silent-wrong was zero in both, so these tasks are too easy to test the claim holv exists for; the benefit side needs tasks with real traps (overflow, aliasing, an effect the program must not have). The harness did not record which compile errors occurred, which was the most useful data; it does now (`feedback` per attempt, every attempt file kept). Numbers published whichever way they go.

## Adding a task

`tasks/<name>/`: `task.md`, `task.json` (`params`, `visible`, `hidden`), `ref.holv` and `ref.mjs` (must pass; the harness is validated against them), optionally `wrong.holv`/`wrong.mjs` (a plausible wrong answer that passes the visible case) for the feedback-loop check.
