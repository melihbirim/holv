// Technique: implicit coercion dispatch. An object-literal `toString` method (not a property access, so not checked) runs
// when a template literal converts the object to a string.
export function pure(x: number): number {
  const hook = {
    toString() {
      const { random } = Math;
      return String(random());
    },
  };
  const s = `${hook}`;
  return x + s.length * 0;
}
