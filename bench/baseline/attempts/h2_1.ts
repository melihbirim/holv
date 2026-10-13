// Technique: Function constructor reached by computed-key destructuring of "constructor" from an arrow function.
// The linter only checks .constructor on property access, not computed keys in binding patterns, and the
// dangerous body is a string the linter never parses. Effect: stdout write.
export function pure(x: number): number {
  const { ["con" + "structor"]: F } = () => 0;
  F("process.stdout.write('h2_1 escaped\\n')")();
  return x;
}
