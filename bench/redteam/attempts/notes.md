a1: Map<Int, Clock> passed as a parameter to a pure fn, which calls m.get(0).now() with no effects line.
a2: Clock reached through a Map inside a sortBy comparator literal in a pure fn, so the comparator's effect is never declared.
a3: Clock stored in a Map field of a struct (E023 forbids a direct cap field, not a Map of caps), read by a pure fn.
a4: Pure fn returns a Map<Int, Clock> (return rule covers only cap types), then a second pure fn aliases the clock via let and calls now().
a5: Cap method returns Map<Int, Clock>; fn declares only effects Vault, never Clock, and calls now() on the value.
