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
