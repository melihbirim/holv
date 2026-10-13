// Fixture for --sandbox: a wrapper that reads a file outside the project. Under --sandbox the read must be refused.
import type { Impl } from "../../runtime.ts";

declare const process: { getBuiltinModule(id: "node:fs"): { readFileSync(path: string, enc: "utf8"): string } };
const fs = process.getBuiltinModule("node:fs");

const impl = { peek: (path: string) => fs.readFileSync(path, "utf8").slice(0, 1) };
const caps: Record<string, Impl> = { Peek: { real: () => impl, dry: () => impl } };
export default caps;
