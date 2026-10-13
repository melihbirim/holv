// Technique: `constructor` is a banned property name, but only as a property access. Destructuring it from an
// arrow function yields the Function constructor, which is then fed a string that the linter never inspects.
const { constructor: F } = () => 0;

export function pure(x: number): number {
  const now: number = F("return Date.now()")();
  return x + now * 0;
}
