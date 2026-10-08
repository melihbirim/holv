b1: fn takes a Clock param but its effects line lists only Out, so Clock is omitted from the signature.
b2: sortBy comparator in main captures clock and writes an outer var; a pure fn then reads the smuggled value from the list.
b3: pure fn shadows the name clock with an Int, and an example line on a pure fn calls clock.now() directly.
b4: duplicate fn name, a pure grab() and an effectful grab(clock), called from a pure caller to exploit overload or last-wins resolution.
b5: mutual recursion where pong takes a Clock but has an empty effects line while calling effectful ping.
