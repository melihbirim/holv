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
  return x + 3 + f0(x) + f1(x);
}

function f3(x: number): number {
  return x + 4 + f0(x) + f1(x) + f2(x);
}

function f4(x: number): number {
  return x + 5 + f0(x) + f1(x);
}

function f5(x: number): number {
  return x + 6 + f4(x) + f3(x);
}

function f6(x: number): number {
  return x + 7 + f1(x) + f0(x);
}

function f7(x: number): number {
  return x + 8 + f0(x);
}

function f8(x: number): number {
  return x + 9 + f2(x) + f4(x);
}

function f9(x: number): number {
  return x + 10 + f2(x) + f7(x);
}

function f10(x: number): number {
  return x + 11 + f6(x) + f8(x) + f7(x);
}

function f11(x: number): number {
  return x + 12 + f1(x);
}

function f12(x: number): number {
  return x + 13 + f10(x) + f2(x) + f6(x);
}

function f13(x: number): number {
  return x + 14 + f0(x);
}

function f14(x: number): number {
  return x + 15 + f4(x) + f8(x);
}

function f15(x: number): number {
  return x + 16 + f6(x) + f14(x) + f2(x);
}

function f16(x: number): number {
  return x + 17 + f9(x);
}

function f17(x: number): number {
  return x + 18 + f13(x);
}

function f18(x: number): number {
  return x + 19 + f16(x) + store.get("k18");
}

function f19(x: number): number {
  return x + 20 + f1(x) + f16(x) + f0(x);
}

function f20(x: number): number {
  return x + 21 + f7(x) + f13(x);
}

function f21(x: number): number {
  return x + 22 + f17(x) + f10(x) + f14(x) + store.get("k21");
}

function f22(x: number): number {
  return x + 23 + f10(x) + f21(x) + f11(x);
}

function f23(x: number): number {
  return x + 24 + f22(x) + f18(x) + f7(x);
}

function f24(x: number): number {
  return x + 25 + f5(x) + f19(x);
}

function f25(x: number): number {
  return x + 26 + f13(x) + f17(x);
}

function f26(x: number): number {
  return x + 27 + f12(x) + f17(x) + clock.now();
}

function f27(x: number): number {
  return x + 28 + f21(x) + f11(x) + store.get("k27");
}

function f28(x: number): number {
  return x + 29 + f0(x) + f20(x) + f15(x);
}

function f29(x: number): number {
  return x + 30 + f24(x) + f19(x) + f13(x);
}

function f30(x: number): number {
  return x + 31 + f23(x) + f20(x) + f13(x);
}

function f31(x: number): number {
  return x + 32 + f9(x) + store.get("k31");
}

function f32(x: number): number {
  return x + 33 + f26(x);
}

function f33(x: number): number {
  return x + 34 + f18(x);
}

function f34(x: number): number {
  return x + 35 + f29(x) + f26(x) + f12(x) + net.fetch("u34");
}

function f35(x: number): number {
  return x + 36 + f11(x) + f32(x) + f27(x) + clock.now();
}

function f36(x: number): number {
  return x + 37 + f22(x) + f6(x) + clock.now();
}

function f37(x: number): number {
  return x + 38 + f9(x) + f23(x) + f34(x);
}

function f38(x: number): number {
  return x + 39 + f36(x) + f19(x);
}

function f39(x: number): number {
  return x + 40 + f20(x) + f33(x) + f37(x);
}

console.log(f39(Number(process.argv[2] ?? 1)));
