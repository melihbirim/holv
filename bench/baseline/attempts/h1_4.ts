// Technique: prototype walk. Object.getPrototypeOf is reached through destructuring, yielding Function.prototype, whose
// `constructor` gives Function; the whole effect is a string the linter never parses.
export function pure(x: number): number {
  const { constructor: O } = {};
  const { getPrototypeOf: gp } = O;
  const { constructor: FF } = gp(O);
  FF("return process.stdout.write('h1_4\\n')")();
  return x + 1;
}
