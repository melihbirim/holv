# baseline: can a linter on restricted TypeScript replace holv's effect guarantee?

`lint.mjs` is a first-draft linter (banned ambient names and properties, no imports, no `any`, no assertions). `verify.mjs` lints each `attempts/*.ts`, then, if accepted, calls `pure(1)` with tripwires on clock, random, stdout, fs, network and `Event` timestamps.

## Round 1 (2026-10-13): three fresh Haiku 4.5 attackers, five attempts each

| verdict | count |
|---|---|
| BLOCKED | 0 |
| ESCAPED | 15 |

All escapes get past the name checks: destructuring (`const { random } = Math`), reaching `Function` through `constructor` and running effect code from a string, getters and `toString` run implicitly, `Error.prepareStackTrace`, `Event().timeStamp`. `h2_5` was first HARMLESS only because the verifier had no tripwire for it; fixed.

`holv/h1`–`h5` are not ports (holv has no `Function`, destructuring or getters): they are the nearest holv attacks, a cap in a struct, a cap param without `effects`, a static `Clock.now()`, an effectful callee from a pure fn, a cap returned from a fn. `holvc check` rejects all five (E023, E021, E030, E021+E022, E023); round 1 in bench/redteam covered the same ground with ten more attempts.

Caveat: one quick linter draft says little about the best possible linter. It shows the cost: every closed hole removes a TypeScript feature.
