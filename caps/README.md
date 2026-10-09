# caps

Reviewed capability wrappers for npm packages. One directory per package. A program uses one with `holvc run f.holv --caps <name>`.

Each entry has:

- `cap.holv`: the `cap` declaration to paste into the program (single-file language until #11).
- `caps.ts`: the wrapper. Imports the package, exposes only the methods in the manifest, provides `real` and `dry`.
- `package.json` with an exact version, and `pnpm-lock.yaml`.
- `CAP.json`: the manifest. `package`, exact `version`, `integrity` copied from the lockfile, `pure` (an explicit reviewed claim, never inferred), `methods` exposed, `generated_by` (`hand` or the `holvc cap` version), `reviewed_by` naming a human and a model.

`holvc caps verify` checks the manifest against `package.json`, the lockfile and `caps.ts`, which it parses and never imports (C002 if the registry is not a plain object literal); `test.sh` runs it. `.github/CODEOWNERS` requests a human review for any change under `caps/`.

A pull request that changes `version`, `integrity`, `pure` or `methods` of an existing entry is reviewed by a human. Adding an entry: run the program under `--simulate` and paste the effect log in the PR.

This directory becomes its own repository (`holv-caps`) when it has ten entries or its first outside contributor, whichever is first.
