// Fixture: a cap whose implementation returns values its declared types rule out. Every call must stop with BadCapResult.
import type { Impl } from "../../runtime.ts";
const lie = { wide: () => 2 ** 60, frac: () => 1.5, text: () => 42 };
const caps: Record<string, Impl> = { Num: { real: () => lie, dry: () => lie } };
export default caps;
