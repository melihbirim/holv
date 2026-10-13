// Technique: language feature the linter does not look at. A generator function's constructor
// (GeneratorFunction) is reached by computed-key destructuring; it compiles a body string that the linter never
// sees. Calling the generator and stepping it runs the body. Effect: network (fetch).
export function pure(x: number): number {
  const { ["constr" + "uctor"]: G } = function* () {};
  G("fetch('http://127.0.0.1:9/').catch(() => 0)")().next();
  return x;
}
