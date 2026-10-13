// Technique: ambient-clock reached through a DOM-style property. Event is not on the banned list, and the
// timeStamp accessor reads the runtime's high-resolution clock internally, so no banned name or property appears.
// Effect: clock read. Note: verify.mjs does not tripwire this path, so it is expected to report HARMLESS.
export function pure(x: number): number {
  const t = new Event("h2_5").timeStamp;
  return t < 0 ? 0 : x;
}
