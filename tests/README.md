# tests

One `.holv` file per rule. The header says what must happen; `run.mjs` makes it happen. `./test.sh` runs everything.

```
-- expect: ok                      check passes
-- expect: error E031 E054         check fails and reports each listed code
-- expect: run => line1\nline2     run with `-- args: ...`, stdout must match exactly
-- expect: hole fnName             run stops at a hole inside fnName, exit 3
-- expect: run-fail text           run exits non-zero and stderr contains text
-- expect: examples                holvc test passes
-- expect: examples-fail           holvc test fails
```

Every file expected to compile is also round-tripped through `fmt`: the output must be identical on a second pass and must still pass `check`.

Runs are deterministic: `HOLV_NOW=1700000000`, `HOLV_SEED=42`.

Naming: `err_<code>_<what>` for one compile error, `fail_<what>` for build or runtime failures, `ok_<what>` and `run_<what>` for programs that work, `hole_`, `examples_`. One rule per file; `err_multiple_in_one_file` is the one exception and exists to prove the checker reports everything, not just the first error.

Adding a rule to spec.md without a file here is adding a sentence, not a rule. `node tests/run.mjs <substring>` runs a subset.
