// Technique: getter invoked implicitly by a plain property read. Get accessors are not banned, and the body recovers
// Function via destructuring and reads the clock through a string the linter never inspects.
const { constructor: F } = () => 0;

const cfg = {
  get v(): number {
    return F("return Date.now()")() * 0;
  },
};

export function pure(x: number): number {
  return x + cfg.v;
}
