# Handoff: APIs, contracts, SOAP, REST, OpenAPI, Unix tools

Context for a session continuing this thread. Written 2026-10-06 by Claude, from a conversation with Melih Birim while building holv (https://github.com/melihbirim/holv, a language for AI agents). Read AGENTS.md in that repo before touching code; this note is the design thread only.

## The question

Melih asked: if an agent designed an HTTP API, what would it do? Then: if an agent were the founder of REST, what would it change? The thread went REST → "you are fixing SOAP" → "OpenAPI already solves this" → "programs should be Unix tools, versioned by hash" → "the compiler should generate the contract by default". Each turn moved the conclusion. The final position is at the end; the path matters because the other session will face the same objections.

## Turn 1: an API in holv, built

A REST API in holv is one function and a host:

```
type Request { method: String, path: String, body: String }
type Response { status: Int, body: String }
cap Store { add(name: String): Int, count(): Int, get(i: Int): String }

fn handle(store: Store, req: Request) -> Response
  effects Store
{ ... routing by if/else on method and path ... }
```

The host (15 lines of TypeScript, `examples/api/serve.ts`) owns the socket and the `Store` implementation, calls `handle` per request, writes the response. The program cannot open ports, read files or call out; it has exactly the capabilities `handle` declares. Swap the host for a Cloudflare Workers `fetch` and `Store` for a D1 binding and nothing in the holv changes (issue #13).

What a reviewer reads: the two types, the cap, and `effects Store`. That is the complete contract.

It ran (`examples/api/`). It exposed: no string escape (`quote()` cannot escape an embedded `"`, so a name with a quote produced invalid JSON; logged on #14), no `match` for routing (#8), no `Map` (#18), holv is synchronous so the host does async.

## Turn 2: "if you founded REST"

Claude's list, as the agent-consumer of APIs:

1. The contract lives at the URL, not in a PDF: `GET /items` with `Accept: contract` returns the machine-readable spec for that resource, small enough to fit in a prompt.
2. Effects declared per operation: `safe`, `idempotent`, `irreversible`, plus cost. One mutating verb with a declared effect class instead of PUT/PATCH/POST trivia.
3. Dry run is standard: `Dry-Run: true` returns the effect plan and does nothing.
4. Idempotency keys required on every non-safe request.
5. Errors say what to do: `{"code","msg","expected","got","missing","fix":{"do":"..."}}`.
6. Capabilities, not bearer tokens: scoped, attenuable (macaroon style).
7. Affordances in every response: the operations valid from here, with contracts inline. HATEOAS, which humans never implemented and agents actually need.
8. Contract hash on every request; server refuses with a diff if its contract changed.
9. One canonical encoding, sorted keys.
10. Budgets in the contract, enforced by the server.
11. Long-running work as a job resource with an effect log.

Honest caveat given at the time: every piece exists somewhere (OpenAPI, RFC 9457 Problem Details, the idempotency-key draft, macaroons, HAL, GraphQL schemas), badly integrated.

## Turn 3: "so you'd fix SOAP to invent REST?"

Melih's objection, accepted. Precise version: SOAP had the right instinct and the wrong size. SOAP's instinct, a machine-readable contract with typed messages, was right and is exactly what an agent wants. SOAP lost for reasons unrelated to contracts: the contract was unreadable (WSDL + XSD + WS-*), nothing worked without tooling, designed by vendor committees, XML envelopes. REST won on human ergonomics (type a URL, curl it, read JSON) and threw out the contract to get there; the ecosystem has spent twenty years bolting it back on.

Resulting rule: REST plus the contract, under one constraint SOAP never had: **the contract must fit in a prompt.** The moment it needs a code generator to consume, it is SOAP again and loses again. The pendulum (GraphQL, gRPC) swings back toward contracts and gets heavy each time. What stays is whatever an agent can use with zero tooling: curl, read the contract, call.

## Turn 4: "Swagger and OpenAPI solve these problems in some sense"

Also accepted, and it changed the answer from invent to extend. OpenAPI has what no new format can buy: every model already knows it. Inventing a competitor would repeat holv's own bootstrap problem (zero corpus) for no gain.

What OpenAPI already gives: types, operations, examples, error schemas, a URL to fetch, tooling everywhere. Items 1, 5 (partly), 11 of the list.

What it does not, and why each matters to an agent:

- Describes, does not enforce. The document sits beside the API; servers rarely validate responses against it. Drift is normal. An agent trusting the spec is trusting a README.
- No effect class, no cost.
- No dry run, no required idempotency key.
- Errors without a `fix`.
- Security is ambient (bearer, OAuth): whoever holds the token holds everything.
- Size: Stripe's spec is megabytes. Fix is not a format, it is serving a per-resource slice at the resource.
- `links` exist in OpenAPI 3 and nobody uses them; it is the HATEOAS piece agents need.

**Conclusion of the API thread:** extend OpenAPI by a small profile of `x-` fields (`x-effect`, `x-cost`, `x-dry-run`, `x-idempotency`, `x-fix` in error schemas, scoped-capability security), serve it in prompt-sized slices per resource, validate responses at runtime against it. The genuinely missing thing in the world is enforcement and the agent-facing fields, not a description format.

For holv: `holvc cap --openapi <url>` generates a `cap` from an OpenAPI document, `dry` answers from the document's own examples, the manifest records the document hash so `caps verify` notices upstream changes. Filed as #33.

## Turn 5: Unix tools, versions by hash

Melih's proposal: programs should be like `grep`, `jq`, `more`: small tools with a CLI; build them in advance, keep multiple versions, let code call the version it was written against, and keep the contract as a hash of the version.

Claude's position: strong agreement with three amendments.

Why the Unix model fits agents better than humans: a tool's contract is small and at hand; a pipeline is an effect plan you can read before it runs; the process is a real enforcement boundary (OS sandboxing per tool), which `cap` on a single Node process is not; composition without a shared build.

Three things Unix got wrong for agents: untyped text (fix: JSON lines in and out, as `jq` already does; nushell and PowerShell proved structured pipes work); no self-description (fix: `tool --contract` prints a machine-readable contract, prompt-sized, which is the thing you hash); prose errors on stderr and exit code 1 (fix: JSON errors with `code` and `fix.do`, stable exit codes).

On versioning: Nix solved content-addressed, coexisting versions in 2006 (`/nix/store/<hash>-jq-1.7`) and nobody adopted it because the UX was built for humans who hate it; agents will not mind. The contract hash is the piece Nix lacks: it answers "did the interface change" separately from "did the bytes change".

Caveats: spawn cost is a millisecond per call, so tools for coarse pipeline steps and functions for fine ones; hash pinning means no accidental upgrades, which also means no accidental patches, so `caps verify` must be able to flag a pinned version with a known advisory.

Filed: #34 (tool caps: pinned binary, JSON lines, `binary_sha256` + `contract_sha256`, OS sandbox per process, dry from recorded examples) and #35 (holv programs as Unix tools: `In` cap, `--contract`, stable exit codes, one binary via #16).

This makes one mechanism with three sources: npm packages (#28), OpenAPI documents (#33), executables (#34), all entries in `caps/` with the same manifest shape (`CAP.json`: version, integrity hash, contract hash, `pure`, methods exposed, reviewed_by naming a human and a model). Tracked in #31.

## Turn 6: generate the contract by default

Melih: generate the CLI contract at the compiler level, from main's in/out parameters, by default. His career-long point: people write docs, then the code changes and the document does not; the contract must derive from the code so it cannot lie.

Built the same hour, on main: `holvc contract f.holv` derives types, caps, every fn with params/return/effects/examples verbatim, `main`'s arguments and caps, usage line, exit codes, error shape, from the AST, with a sha256 over the canonical JSON that changes exactly when the interface changes. Every `holvc build` writes `<name>.contract.json`; every built program answers `--contract`. Nothing to write, nothing to drift. AGENTS.md now has a section "Documentation that cannot lie": prose about an interface is a bug; delete it or turn it into an `example` line.

## Final position, in one paragraph

Do not invent a protocol and do not fix SOAP. Use OpenAPI as the carrier, add a six-field agent profile, serve it in prompt-sized slices, enforce it at runtime. Treat every external thing, npm package, HTTP API, executable, as a capability with a pinned content hash and a separately hashed contract, reviewed once, reused by everyone, dry-runnable without touching the world. Generate every contract from code; never write one. Keep every contract small enough for an agent to use with curl and no tooling, because that is the only property that has ever survived a pendulum swing.

## Open questions for the next session

1. The exact `x-` profile: names, allowed values, where `x-fix` lives in an error schema. Nothing is specified beyond the field names above.
2. Per-resource slicing of an OpenAPI document: what `Accept` value, how `$ref`s across slices resolve, how big a slice may be.
3. Runtime validation of responses against the spec: where it runs (server middleware, the holv cap wrapper, both), what happens on mismatch (refuse? log? `fix.do` saying the server drifted?).
4. Scoped capabilities over HTTP: macaroons, biscuits, or something simpler; how a holv `cap` carries one.
5. `--contract` for tools that lack it (`jq`, `grep`): hand-written in the manifest, or generated from `--help` by an agent and reviewed.
6. Whether a holv program should be able to *serve* its contract over HTTP itself (the host exposing `/.contract` from `<name>.contract.json`), which would make a holv API self-describing with zero extra work.

## Where things are in the repo

- Built: `holvc contract`, `--contract`, `examples/api/`, `caps/slugify` with manifest, `--caps <name>`.
- Issues: #13 Workers target, #14 strings (with the JSON escape case), #28 cap from `.d.ts`, #30 supply chain and sandbox policy, #31 `caps/` format and `caps verify`, #33 cap from OpenAPI, #34 tool caps, #35 holv programs as Unix tools.
- Rule in force: milestone `0.1 core` closes before any of #28, #33, #34, #35 starts. Core has five issues left (#2, #20, #21, #30, #31). A daily routine works one core issue per run.
