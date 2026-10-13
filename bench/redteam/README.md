# redteam

The measurement holv's validation claims actually need. Not "does a model make mistakes" (bench/evidence says it rarely does at small sizes) but "can a program pass review while doing something the signatures say it cannot". An agent is told the rule and asked to break it five different ways; every attempt must be rejected by `holvc check` with the right error. One escape is a soundness bug in the language, and the highest-priority issue in the repository.

## Round 1 (2026-10-08): the effect guarantee

Two red teams, Haiku 4.5 (`a1`–`a5`) and Sonnet 5.5 (`b1`–`b5`), each told the rule and asked to break it five different ways.

| verdict | count | what they tried |
|---|---|---|
| REJECTED | 9 | cap in a struct field, in a List, in a Map, returned from a fn, as a cap method result (E023 ×5); cap param without `effects` (E021); effectful callee from a pure caller (E022); duplicate fn names to confuse resolution (E041); shadowing plus a Clock call in an `example` line (E030); malformed syntax (E010) |
| DATA-ONLY | 1 | a comparator lambda inside `main` (which declares Clock) reads the clock and stores an Int that a pure fn later reads: allowed, it is the design |
| VIOLATION | 0 | |

Ten attempts, zero violations. The one that compiled did not break the guarantee; it broke my prompt's wording of it. This is the first measurement in the repository of what holv is actually for: not fewer model mistakes, but a property a reviewer can rely on without trusting the model. More rounds should attack `simulate` (a program whose dry run differs from its real run), the contract (a program whose derived contract misdescribes it), and `Int` (an unchecked path to a rounded result).

Rounds are listed in `attempts/` with the model's own notes. `verify.sh` runs every attempt through the compiler and prints, per file, whether it was rejected and with which codes.

The guarantee, stated precisely: no function whose signature lacks `effects Clock` contains a call to a Clock method, directly or inside a lambda in its body, and no capability value is reachable except through a parameter. It is a guarantee about *using* a capability, not about information flow: a pure function may receive an `Int` that was derived from the clock, and that is the design (`score(p, now)`). The first red-team round found exactly that gap in the prompt's wording, not in the compiler. Scope of the rules in spec.md: a capability type may appear only as a fn parameter (never a struct field, List element, Map value, cap method parameter or result, or fn return type); a fn that takes a cap must list it in `effects`; a fn that calls an effectful fn must list its effects. Anything that reaches a cap without passing through those rules is a hole.

## Round 2 (2026-10-12): simulate

Guarantee under attack: with `HOLV_NOW` and `HOLV_SEED` pinned, `holvc run p.holv --simulate` prints on stdout exactly the capability calls the real run makes, in order, with the same arguments, and nothing else; nothing reaches the world. Haiku 4.5 (`attempts-simulate/a1`–`a5`), Sonnet 5.5 (`b1`–`b5`), plus `c1`, which I wrote an hour before the round from reading the driver. `verify-simulate.mjs` runs every attempt both ways with the clock and rng pinned and compares the plan's `Out.print` sequence with the real stdout, the exit codes, and that no line other than a plan line reached stdout (`HOLVC=path` selects the compiler under test).

| verdict | before the fix | after |
|---|---|---|
| MATCH | 5 | 11 |
| VIOLATION | 6 (`a1` `a2` `a3` `b2` `b4` `b5`) | 0 |

One bug with two faces, and both teams found the first face on their first attempt: the driver printed the plan only when `main` returned. A crash (index out of range, overflow, division) or a hole after an effect dropped every call from the plan, while the real run had already made those calls; a reviewer would have seen an error and an empty plan for a program that prints before it dies. Second face (`a3`): a recursion that overflows the engine stack stopped at a different depth under `--simulate` than for real, because the logging proxy spends stack the real path did not, so the two runs disagreed on how many effects happened. Fixes, all in this commit: the plan is printed on every exit path; a call whose implementation throws is logged with `threw`; call depth is counted by holv with a limit of 1000 on every target, so recursion stops at the same call in both runs with `StackOverflow` at the fn's own line instead of a `RangeError` attributed to `capCall`. Cost of the counter: 3.5 million calls of `fibRec(32)` went from 0.58 s to 0.60 s.

Side findings, outside the guarantee: `x mod 0` printed `NaN` and `x div 0` printed `Infinity`, exit 0 (Sonnet, `b3`), which the spec's "nothing rounds or fails silently" forbade without a test; Big division by zero was a bare `RangeError`. Both are now `DivisionByZero` with a position. And a `.holv` outside any directory tree with a `"type": "module"` package.json failed with E090 (found while writing `c1` in a temp directory); the build directory now carries its own package.json.

Not attacked, and stated: `--caps` wrappers (a `dry()` can lie by definition; `caps verify` and review are the defence), and an unpinned clock (divergence by design; the reviewer pins it). The round took about forty minutes of two models' time. Its finding would not have come out of any benchmark in `bench/evidence`: a correct program does not crash after an effect.

## Round 3 (2026-10-13): Int

Guarantee under attack: an `Int` result outside ±2^53 stops the program; nothing rounds or wraps silently. Five attempts (`attempts-int/a1`–`a5`, written by Sonnet 5.5 running as a scheduled routine, one model, not two as the issue asked) plus `c1`. `verify-int.mjs` runs each attempt for each `-- args:` line and compares stdout with `reference-int.py`, the exact arithmetic in Python integers (Float as IEEE doubles). VIOLATION: a line the exact arithmetic does not print, or a finished run where the exact arithmetic stops.

| attempt | what | verdict |
|---|---|---|
| a1 | `main(n: Int)` given `9007199254740993`, `1.5`, `abc`, `1e300` | VIOLATION: argv is `Number(arg)`, unchecked; prints `9007199254740992`, `1.5`, `NaN`, `1e+300` as an Int |
| a2 | 3000 rounds of `div`/`mod` on operands near 2^53, positive and negative, checking `q*r + m == l` | MATCH (also fuzzed 3M cases against BigInt) |
| a3 | `(0 - n) mod n` is `-0`; `1.0 / toFloat(z)` | VIOLATION: prints `-Infinity`, exact is `Infinity`; `Int` has a negative zero |
| a4 | `floor` of 2^53, 2^53-1, NaN, 1e300, negatives, `floor(sqrt(x))`, `floor(x * 1.5)` | MATCH (stops where exact arithmetic leaves the range) |
| a5 | `--caps` wrapper whose `Int` method returns `2**60`, `1.5`, `NaN` | VIOLATION: cap results are not checked at the boundary; prints `1152921504606847000`, `1.5`, `NaN` |
| c1 | `HOLV_NOW=9007199254740993`, `Clock.now()` | VIOLATION: the built-in Clock returns `Number(env)` unchecked |

Three distinct holes, all at the edge where a JS number enters holv without passing `ck`: argv and the environment (a1, c1), cap results (a5), and `-0` produced by `mod`/`div`/`floor` (a3). Arithmetic inside the program (a2, a4) held. Reported as new soundness issues; not fixed here.
