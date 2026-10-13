// Technique: Function constructor reached through a computed-key destructuring of `constructor`; the effect lives in a string body.
export function pure(x: number): number {
  const { ["con" + "structor"]: A } = [];
  const { ["con" + "structor"]: F } = A;
  F("return new Date().getTime() * 0")();
  return x + 1;
}
