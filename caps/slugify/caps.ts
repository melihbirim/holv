// Capability wrapper for the npm package `slugify`. This file is TypeScript, lives outside the program,
// and is the only place the package appears. The holv program sees `cap Slug` and nothing else.
import slugifyModule from "slugify";
import type { Impl } from "../../runtime.ts";

// slugify ships CommonJS code with ESM-shaped types, so under nodenext the default import is typed as the
// module namespace while Node hands back the function. Absorbing that mismatch here is the wrapper's job.
type Slugify = (s: string, options?: { lower?: boolean; strict?: boolean }) => string;
const slugify = slugifyModule as unknown as Slugify;

const impl = { slugify: (s: string) => slugify(s, { lower: true, strict: true }) };

const caps: Record<string, Impl> = {
  // pure: dry is the real implementation. An impure package gets a stub here instead.
  Slug: { real: () => impl, dry: () => impl },
};
export default caps;
