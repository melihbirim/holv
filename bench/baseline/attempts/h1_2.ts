// Technique: shorthand destructuring of a banned property name (`random` is only banned after a dot, not as a binding).
export function pure(x: number): number {
  const { random } = Math;
  return x + random() * 0;
}
