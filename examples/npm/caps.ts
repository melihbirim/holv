// Capability implementations for slug.holv. This file is TypeScript, lives outside the program,
// and is the only place an npm package appears. The holv program sees `cap Slug` and nothing else.
import slugify from "slugify";
import type { Impl } from "./.holv-out/runtime.ts";

const impl = { slugify: (s: string) => slugify(s, { lower: true, strict: true }) };

const caps: Record<string, Impl> = {
  // slugify is pure, so the dry implementation is the real one; an impure package would get a stub here.
  Slug: { real: () => impl, dry: () => impl },
};
export default caps;
