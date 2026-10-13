# compare: one task, five languages, three models

Pilot of the cross-language measurement. Task: `bench/evidence/tasks/ledger`. 15 fresh subagents (Haiku, Sonnet, Opus, once each per language) wrote the same program in holv, TypeScript, Python, Rust and Zig, each in its own directory with no shared memory; up to 5 attempts, only the visible example known. `check.mjs <task> <lang> <file>` builds the file and runs the visible and 5 hidden cases. The holv agents got `holvc spec` and nothing else; the Zig agents were told the version (0.17.0) and where the std source is. Programs are in `ledger/`.

## Result (2026-10-13)

| language | haiku | sonnet | opus | hidden cases | median tokens | median attempts |
|---|---|---|---|---|---|---|
| holv | 45,857 / 3 | 35,737 / 1 | 36,199 / 1 | 3/3 pass | 36,199 | 1 |
| TypeScript | 36,939 / 2 | 31,816 / 1 | 32,444 / 1 | 3/3 pass | 32,444 | 1 |
| Python | 37,091 / 1 | 31,676 / 1 | 32,526 / 1 | 3/3 pass | 32,526 | 1 |
| Rust | 41,344 / 1 | 32,251 / 1 | 33,651 / 1 | 3/3 pass | 33,651 | 1 |
| Zig | 46,135 / 2 | 33,947 / 2 | 35,059 / 1 | 3/3 pass | 35,059 | 2 |

Cells are subagent total tokens / attempts the agent reported. Tokens are the subagent's total (input and output, including its fixed starting context), not split; attempts are self-reported.

## What it shows, and what it does not

- All 15 programs pass all 6 cases. No silent-wrong result in any language. The task is too easy to separate them on correctness.
- Cost: holv is the most expensive median (+12% over TypeScript), and Haiku in holv took 3 attempts against 1–2 elsewhere. The spec is the price of a language the model has never seen. Zig also needed retries (API drift in 0.17).
- Three runs per cell, one task, 5 hidden cases: differences under about 15% are within noise (see bench/evidence README for how large the run-to-run spread was).
- Setup note: the first three holv agents were blocked by a missing `spec.md` in their sandbox (my harness error); they produced no program and are not counted. Fresh agents were run in a repaired sandbox.

## Warm sequence (2026-10-13): one session, three tasks

One Sonnet agent per language did `ledger`, then `inventory`, then `expr` in the same session (SendMessage between tasks, so the spec and earlier work stay in context). Hidden cases were enlarged: ledger 18, inventory 17, expr 54 (`mktask.mjs`: extra inputs, expected output from the JS reference and cross-checked against `ref.holv`; one case where the two references disagreed (`--3`) and one that `ref.holv` could not run were dropped). Programs are in `warm/`.

| language | tokens after task 1 | after task 2 | after task 3 | marginal 2 / 3 | attempts 1 / 2 / 3 | hidden passed |
|---|---|---|---|---|---|---|
| holv | 35,832 | 38,326 | 40,830 | +2,494 / +2,504 | 2 / 1 / 1 | 17/18, 17/17, 54/54 |
| TypeScript | 32,053 | 33,575 | 35,151 | +1,522 / +1,576 | 1 / 1 / 1 | all |
| Python | 31,862 | 33,284 | 34,782 | +1,422 / +1,498 | 1 / 1 / 1 | all |
| Rust | 32,236 | 34,170 | 35,882 | +1,934 / +1,712 | 1 / 1 / 1 | all |
| Zig | 33,948 | 36,352 | 39,977 | +2,404 / +3,625 | 2 / 1 / 2 | all |

Tokens are the subagent's cumulative total (input and output, including its starting context), read after each task.

- The spec is paid once: holv cost +3.8k over TypeScript on task 1, and about +1k per later task. Over the three tasks holv is +16% over TypeScript, the same order as the cold pilot (+12%). Zig is as expensive as holv; Python is cheapest.
- One miss, in holv: `ledger` hidden case 12, `deposit:a:9007199254740000;deposit:a:900`. The program rejected the 16-digit amount (it prints `a 900`, `rejected 1`, exit 0): the agent kept amounts in `Int` and guarded against the 53-bit limit by rejecting, a plausible reading of a task that states no size limit, and a silent wrong answer under the stated exactness expectation. The other four languages used wide integers or bignums by default. The holv spec says `Int` stops at ±2^53 and offers `Big`; the agent did not reach for it on a ledger. Task-spec ambiguity and a language property both contribute; one case, one agent.
- One run per language, one model. This is a single sample, not a measurement of spread.
