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
