# review

The reading claim: in holv, "can this function reach the network?" is one line in its signature; in TypeScript it is a traversal of every body underneath. If that is true, a cold reviewer should answer effect questions more accurately on holv as programs grow. This directory measures it.

- `gen.mjs <fns> <seed> <dir>` generates one program in both languages from the same random call graph (a DAG; some leaves touch a capability). holv passes capabilities as parameters and every `effects` line is exact, which `holvc check` independently confirms. TypeScript uses module-level `clock`, `store`, `net` objects, the way most codebases do; signatures say nothing. Bodies are trivial arithmetic so the only thing to read is who calls whom.
- Six yes/no questions per program: can `fN` reach `Clock`/`Store`/`Net`, directly or through any call. Exact ground truth from the graph.
- `run.mjs prompt` builds the reviewer prompt; the reviewer (a cold model, read-only) writes a JSON object; `run.mjs score` checks it; `run.mjs summarize` prints accuracy by program size.

Synthetic, and stated as such: real code has names that hint at effects and bodies that hide them. What this measures is only whether a model reader benefits from the effect being written in the signature when the alternative is tracing calls.

## Results

See `results/` and the table in the holv README's evidence section.
