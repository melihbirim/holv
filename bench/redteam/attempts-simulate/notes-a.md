# redteam simulate, prefix a

Guarantee: `run p.holv ARGS --simulate` prints exactly the capability calls the real run makes, nothing else on stdout.

- a1: `hole Int` reached after two prints and a clock call. BROKEN (b). Real run: 3 stdout lines, exit 3. Sim: 0 stdout lines, exit 3; the plan omits Out.print("start"), Clock.now, Out.print(...). Hole JSON goes to stderr in both runs.
- a2: `xs[clock.now() - 1700000000 + n]` out of range after `out.print("before")`. BROKEN (b). Real (n=5): prints "before", exit 4. Sim (n=5): 0 stdout lines, exit 4, same error JSON on stderr. Plan omits "before" and the Clock.now call.
- a3: recursive `down(out, k)` printing each level. n=2000: identical, 2001 lines. n=8000 (arg, file unchanged): real prints 3388 lines then RangeError exit 4; sim prints nothing, exit 4. BROKEN (b), same mechanism as a1/a2. Also fires at n=20000 and 100000.
- a4: `sortBy` comparator that calls Rng.next, Clock.now and Out.print (n=6). NOT BROKEN: real stdout and sim Out.print args match line for line, same comparison order, sorted output identical.
- a5: JSON-injection string literal (quotes, backslashes, newline, tab, CR, \u0001, a fake plan line) plus Big multiplication from Clock values, returns 3. NOT BROKEN: real and sim match, plan lines are valid one-line JSON, exit 3 in both.

Extra probe (not one of the five): a 200000-iteration print loop with a Clock call each iteration, returning 3 when n>100, gives 400000 plan lines in both sim and pipe output, exit 3. No truncation.

Summary: the stdout divergence is one pattern. When a program dies at runtime (index out of range, hole, stack overflow), `--simulate` emits no plan lines at all, while the real run has already performed calls. The plan appears to be emitted only on successful completion, or lost on a crash. Exit codes and stderr match. Mid-run crashes are the break; the plan is only trustworthy for programs that finish.
