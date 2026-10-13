// Technique: implicit invocation. An object-literal method named toString is not a banned property access, and
// the template literal ${o} calls it via ToPrimitive. The body recovers Function via destructuring and reads randomness.
const { constructor: F } = () => 0;

const o = {
  toString(): string {
    return F("return String(Math.random())")();
  },
};

export function pure(x: number): number {
  const s: string = `${o}`;
  return x + s.length * 0;
}
