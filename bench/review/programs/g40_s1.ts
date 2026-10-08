// capabilities are module-level, as in most codebases
const clock = { now: () => Math.floor(Date.now() / 1000) };
const store = { get: (k: string): number => k.length };
const net = { fetch: (url: string): number => url.length };

function f0(x: number): number {
  return x + 1;
}

function f1(x: number): number {
  return x + 2 + f0(x);
}

function f2(x: number): number {
  return x + 3 + f0(x);
}

function f3(x: number): number {
  return x + 4 + f0(x) + f1(x);
}

function f4(x: number): number {
  return x + 5 + f2(x) + f3(x);
}

function f5(x: number): number {
  return x + 6 + f4(x) + f1(x) + f3(x);
}

function f6(x: number): number {
  return x + 7 + f0(x) + clock.now();
}

function f7(x: number): number {
  return x + 8 + f4(x);
}

function f8(x: number): number {
  return x + 9 + f2(x) + f6(x);
}

function f9(x: number): number {
  return x + 10 + f3(x);
}

function f10(x: number): number {
  return x + 11 + f5(x) + f4(x);
}

function f11(x: number): number {
  return x + 12 + f7(x) + f10(x) + f1(x);
}

function f12(x: number): number {
  return x + 13 + f1(x) + f5(x) + f2(x);
}

function f13(x: number): number {
  return x + 14 + f4(x) + f0(x) + f12(x);
}

function f14(x: number): number {
  return x + 15 + f0(x) + f5(x) + f4(x) + net.fetch("u14");
}

function f15(x: number): number {
  return x + 16 + f2(x) + f9(x);
}

function f16(x: number): number {
  return x + 17 + f0(x) + f15(x) + f12(x);
}

function f17(x: number): number {
  return x + 18 + f11(x) + f16(x);
}

function f18(x: number): number {
  return x + 19 + f7(x) + f2(x);
}

function f19(x: number): number {
  return x + 20 + f12(x) + f10(x) + f0(x);
}

function f20(x: number): number {
  return x + 21 + f18(x) + f6(x);
}

function f21(x: number): number {
  return x + 22 + f19(x);
}

function f22(x: number): number {
  return x + 23 + f9(x) + f7(x) + store.get("k22");
}

function f23(x: number): number {
  return x + 24 + f10(x) + f11(x) + f19(x);
}

function f24(x: number): number {
  return x + 25 + f8(x);
}

function f25(x: number): number {
  return x + 26 + f7(x);
}

function f26(x: number): number {
  return x + 27 + f20(x);
}

function f27(x: number): number {
  return x + 28 + f15(x) + f26(x);
}

function f28(x: number): number {
  return x + 29 + f27(x);
}

function f29(x: number): number {
  return x + 30 + f13(x) + f17(x) + net.fetch("u29");
}

function f30(x: number): number {
  return x + 31 + f0(x) + f5(x) + f16(x) + store.get("k30");
}

function f31(x: number): number {
  return x + 32 + f14(x) + f13(x) + net.fetch("u31");
}

function f32(x: number): number {
  return x + 33 + f23(x) + f16(x) + f25(x);
}

function f33(x: number): number {
  return x + 34 + f31(x) + f9(x);
}

function f34(x: number): number {
  return x + 35 + f19(x) + f4(x) + store.get("k34");
}

function f35(x: number): number {
  return x + 36 + f2(x) + f1(x) + f33(x);
}

function f36(x: number): number {
  return x + 37 + f10(x);
}

function f37(x: number): number {
  return x + 38 + f12(x) + f8(x) + f3(x);
}

function f38(x: number): number {
  return x + 39 + f19(x) + f18(x) + f14(x) + net.fetch("u38");
}

function f39(x: number): number {
  return x + 40 + f33(x);
}

console.log(f39(Number(process.argv[2] ?? 1)));
