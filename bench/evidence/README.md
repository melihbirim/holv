# evidence

Milestone 2 of the README: does an agent reach a correct program in fewer attempts, with fewer silent-wrong results, in holv than in TypeScript? This directory is the measurement. Nothing here is proof until a real model has been run through it and the numbers are published, whichever way they go.

## Protocol

- `tasks/<name>/task.md` is the task, identical for both languages. `task.json` has the integer parameters, one visible example, and hidden cases chosen to include the edges people get wrong (0, 1, boundaries).
- The agent gets: the task, the visible example, where to write the file, and for holv the full `holvc spec` output and nothing else. No holv examples, no AGENTS.md. For TypeScript it gets no spec: the model already knows JavaScript.
- Up to five attempts. After a failure the agent sees compile errors verbatim, a crash's first lines, or a visible-case diff. For a hidden failure it sees only the input, never the expected output.
- Recorded per task and language: attempts, pass, first-try pass, compile failures, silent-wrong (the final attempt passes the visible example and fails a hidden case), agent wall time.
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
