// holv runtime: holes, examples, and the capability registry the generated driver uses.
// Program code never constructs a capability; the driver resolves them here by cap name.
declare const process: { env: Record<string, string | undefined>; argv: string[]; exit(code: number): never };
export const proc = process;

export class HoleReached extends Error {
  at: string; type: string; scope: Record<string, unknown>;
  constructor(at: string, type: string, scope: Record<string, unknown>) {
    super(`hole reached at ${at}: expected ${type}`);
    this.at = at; this.type = type; this.scope = scope;
  }
}
export function hole<T>(at: string, type: string, scope: Record<string, unknown>): T {
  throw new HoleReached(at, type, scope);
}

export function at<T>(xs: T[], i: number): T {
  if (!Number.isInteger(i) || i < 0 || i >= xs.length) throw new RangeError(`index ${i} out of range 0..${xs.length}`);
  return xs[i] as T;
}

export function runExamples(exs: Array<[string, () => unknown, unknown]>): boolean {
  let ok = true;
  for (const [name, run, expected] of exs) {
    let got: unknown, pass: boolean;
    try { got = run(); pass = Object.is(got, expected); } catch (e) { got = String(e); pass = false; }
    ok &&= pass;
    console.log(JSON.stringify({ example: name, pass, expected, got }));
  }
  return ok;
}

// Each entry gives a real implementation and a dry one. Dry impls never touch the world.
// HOLV_NOW and HOLV_SEED pin the clock and rng for reproducible runs.
export type Impl = { real: () => object; dry: () => object };
const registry: Record<string, Impl> = {
  Clock: {
    real: () => ({ now: () => (process.env.HOLV_NOW ? Number(process.env.HOLV_NOW) : Math.floor(Date.now() / 1000)) }),
    dry: () => ({ now: () => Number(process.env.HOLV_NOW ?? 1_700_000_000) }),
  },
  Rng: {
    real: () => lcg(Number(process.env.HOLV_SEED ?? 42)),
    dry: () => lcg(Number(process.env.HOLV_SEED ?? 42)),
  },
  Out: {
    real: () => ({ print: (s: string) => { console.log(s); } }),
    dry: () => ({ print: (_s: string) => {} }),
  },
};
function lcg(seed: number) {
  let x = seed >>> 0;
  return { next: () => { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; return x; } };
}

export class Caps {
  private log: Array<{ effect: string; args: unknown[]; result?: unknown }> = [];
  private simulate: boolean;
  private table: Record<string, Impl>;
  // `extra` comes from --caps file.ts: a module whose default export maps cap names to { real, dry }.
  constructor(simulate: boolean, extra: Record<string, Impl> = {}) { this.simulate = simulate; this.table = { ...registry, ...extra }; }
  get(name: string): object {
    const impl = this.table[name];
    if (!impl) throw new Error(`no implementation for cap ${name}; provide one with --caps file.ts`);
    const target = this.simulate ? impl.dry() : impl.real();
    if (!this.simulate) return target;
    const log = this.log;
    return new Proxy(target, {
      get(t, prop) {
        const v = Reflect.get(t, prop);
        if (typeof v !== "function") return v;
        return (...args: unknown[]) => { const result = v.apply(t, args); log.push({ effect: `${name}.${String(prop)}`, args, result }); return result; };
      },
    });
  }
  plan() { for (const e of this.log) console.log(JSON.stringify(e)); }
}
