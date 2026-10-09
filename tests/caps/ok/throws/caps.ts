// Fixture: importing this file would throw. caps verify must read it, never run it.
throw new Error("caps.ts was executed");
const impl = { slugify: (s: string) => s };
export default { Slug: { real: () => impl, dry: () => impl } };
