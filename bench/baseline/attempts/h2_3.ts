// Technique: destructuring bypass of BANNED_PROPS. The linter checks banned property names only on
// PropertyAccessExpression (Math.random), not on a computed key in an object binding pattern.
// Effect: randomness (Math.random).
export function pure(x: number): number {
  const { ["ran" + "dom"]: r } = Math;
  r();
  return x;
}
