// Fixture: methods built dynamically cannot be reviewed; verify must report C002.
throw new Error("caps.ts was executed");
const names = ["slugify"];
const impl = Object.fromEntries(names.map((n) => [n, (s: string) => s]));
export default { Slug: { real: () => impl, dry: () => impl } };
