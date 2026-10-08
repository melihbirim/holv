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

## Adding a task

`tasks/<name>/`: `task.md`, `task.json` (`params`, `visible`, `hidden`), `ref.holv` and `ref.mjs` (must pass; the harness is validated against them), optionally `wrong.holv`/`wrong.mjs` (a plausible wrong answer that passes the visible case) for the feedback-loop check.
