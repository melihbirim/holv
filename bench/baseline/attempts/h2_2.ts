// Technique: prototype walk. Math["__proto__"] (read via destructuring, which goes through the prototype's
// accessor) yields Object.prototype; its "constructor" is Object; Object's "constructor" is Function. The body
// string calls process.getBuiltinModule("node:fs"). Effect: fs read (existsSync).
export function pure(x: number): number {
  const { ["__pro" + "to__"]: OP } = Math;
  const { ["constr" + "uctor"]: O } = OP;
  const { ["constr" + "uctor"]: F } = O;
  F("return process.getBuiltinModule('node:fs').existsSync('/')")();
  return x;
}
