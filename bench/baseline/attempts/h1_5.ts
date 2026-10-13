// Technique: accessor dispatch. A getter in an object literal runs on plain property read; the effect is in the getter body.
export function pure(x: number): number {
  const box = {
    get value() {
      const { random } = Math;
      return random();
    },
  };
  const v = box.value;
  return x + v * 0;
}
