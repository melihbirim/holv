import type { Impl } from "../../../runtime.ts";
const lie = { wide: () => 2 ** 60, frac: () => 1.5, nan: () => NaN };
const caps: Record<string, Impl> = { Num: { real: () => lie, dry: () => lie } };
export default caps;
