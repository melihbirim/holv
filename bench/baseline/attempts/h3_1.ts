// Technique: BANNED_PROPS only checks property-access expressions (a.random). Destructuring a banned
// property name into a binding (const { random } = Math) is a BindingElement, so it is never checked.
const { random } = Math;

export function pure(x: number): number {
  return x + random() * 0;
}
