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

function f40(x: number): number {
  return x + 41 + f1(x) + f8(x);
}

function f41(x: number): number {
  return x + 42 + f40(x);
}

function f42(x: number): number {
  return x + 43 + f8(x) + f21(x) + f22(x);
}

function f43(x: number): number {
  return x + 44 + f35(x) + f12(x);
}

function f44(x: number): number {
  return x + 45 + f30(x);
}

function f45(x: number): number {
  return x + 46 + f14(x);
}

function f46(x: number): number {
  return x + 47 + f7(x) + f39(x) + f19(x);
}

function f47(x: number): number {
  return x + 48 + f31(x) + f28(x) + f21(x);
}

function f48(x: number): number {
  return x + 49 + f16(x);
}

function f49(x: number): number {
  return x + 50 + f31(x) + f15(x);
}

function f50(x: number): number {
  return x + 51 + f8(x) + f7(x);
}

function f51(x: number): number {
  return x + 52 + f36(x) + f21(x);
}

function f52(x: number): number {
  return x + 53 + f6(x) + f25(x) + f44(x);
}

function f53(x: number): number {
  return x + 54 + f27(x) + f21(x) + f44(x);
}

function f54(x: number): number {
  return x + 55 + f12(x) + f37(x) + clock.now();
}

function f55(x: number): number {
  return x + 56 + f43(x) + f17(x);
}

function f56(x: number): number {
  return x + 57 + f55(x);
}

function f57(x: number): number {
  return x + 58 + f23(x) + f5(x) + f26(x);
}

function f58(x: number): number {
  return x + 59 + f32(x) + f2(x);
}

function f59(x: number): number {
  return x + 60 + f11(x) + f29(x);
}

function f60(x: number): number {
  return x + 61 + f40(x);
}

function f61(x: number): number {
  return x + 62 + f9(x) + f5(x) + f58(x);
}

function f62(x: number): number {
  return x + 63 + f58(x) + f4(x);
}

function f63(x: number): number {
  return x + 64 + f0(x) + f13(x) + clock.now();
}

function f64(x: number): number {
  return x + 65 + f57(x) + clock.now();
}

function f65(x: number): number {
  return x + 66 + f51(x);
}

function f66(x: number): number {
  return x + 67 + f4(x) + f64(x);
}

function f67(x: number): number {
  return x + 68 + f10(x) + f43(x) + net.fetch("u67");
}

function f68(x: number): number {
  return x + 69 + f37(x) + f18(x) + f49(x);
}

function f69(x: number): number {
  return x + 70 + f27(x);
}

function f70(x: number): number {
  return x + 71 + f2(x) + f56(x) + f35(x);
}

function f71(x: number): number {
  return x + 72 + f13(x) + f42(x) + f33(x);
}

function f72(x: number): number {
  return x + 73 + f70(x) + f24(x);
}

function f73(x: number): number {
  return x + 74 + f18(x) + f57(x) + f61(x);
}

function f74(x: number): number {
  return x + 75 + f68(x) + f1(x) + f58(x);
}

function f75(x: number): number {
  return x + 76 + f65(x) + f7(x) + f43(x);
}

function f76(x: number): number {
  return x + 77 + f68(x) + f52(x) + f60(x);
}

function f77(x: number): number {
  return x + 78 + f13(x) + f70(x);
}

function f78(x: number): number {
  return x + 79 + f72(x);
}

function f79(x: number): number {
  return x + 80 + f19(x) + f53(x);
}

function f80(x: number): number {
  return x + 81 + f42(x) + f62(x) + f39(x) + clock.now();
}

function f81(x: number): number {
  return x + 82 + f48(x) + f53(x) + net.fetch("u81");
}

function f82(x: number): number {
  return x + 83 + f63(x) + f49(x) + f5(x) + net.fetch("u82");
}

function f83(x: number): number {
  return x + 84 + f3(x);
}

function f84(x: number): number {
  return x + 85 + f71(x) + f52(x) + f68(x);
}

function f85(x: number): number {
  return x + 86 + f37(x);
}

function f86(x: number): number {
  return x + 87 + f35(x) + f26(x) + f81(x);
}

function f87(x: number): number {
  return x + 88 + f74(x) + f68(x) + f20(x);
}

function f88(x: number): number {
  return x + 89 + f81(x) + f47(x);
}

function f89(x: number): number {
  return x + 90 + f76(x);
}

function f90(x: number): number {
  return x + 91 + f60(x) + f68(x) + f67(x);
}

function f91(x: number): number {
  return x + 92 + f75(x) + f29(x);
}

function f92(x: number): number {
  return x + 93 + f65(x);
}

function f93(x: number): number {
  return x + 94 + f25(x) + f19(x) + f0(x);
}

function f94(x: number): number {
  return x + 95 + f57(x) + net.fetch("u94");
}

function f95(x: number): number {
  return x + 96 + f7(x);
}

function f96(x: number): number {
  return x + 97 + f43(x) + f9(x) + f64(x);
}

function f97(x: number): number {
  return x + 98 + f92(x) + f77(x) + clock.now();
}

function f98(x: number): number {
  return x + 99 + f92(x) + f58(x);
}

function f99(x: number): number {
  return x + 100 + f84(x) + f71(x);
}

function f100(x: number): number {
  return x + 101 + f39(x);
}

function f101(x: number): number {
  return x + 102 + f61(x) + f52(x) + clock.now();
}

function f102(x: number): number {
  return x + 103 + f32(x) + f79(x);
}

function f103(x: number): number {
  return x + 104 + f70(x) + f57(x);
}

function f104(x: number): number {
  return x + 105 + f45(x);
}

function f105(x: number): number {
  return x + 106 + f91(x) + f73(x);
}

function f106(x: number): number {
  return x + 107 + f59(x) + f11(x);
}

function f107(x: number): number {
  return x + 108 + f45(x) + f7(x) + f48(x);
}

function f108(x: number): number {
  return x + 109 + f4(x);
}

function f109(x: number): number {
  return x + 110 + f36(x) + f80(x);
}

function f110(x: number): number {
  return x + 111 + f56(x);
}

function f111(x: number): number {
  return x + 112 + f0(x) + f88(x) + f100(x);
}

function f112(x: number): number {
  return x + 113 + f59(x) + f68(x) + f41(x);
}

function f113(x: number): number {
  return x + 114 + f48(x) + f20(x);
}

function f114(x: number): number {
  return x + 115 + f105(x);
}

function f115(x: number): number {
  return x + 116 + f31(x);
}

function f116(x: number): number {
  return x + 117 + f8(x) + f49(x) + f29(x);
}

function f117(x: number): number {
  return x + 118 + f3(x) + f66(x) + store.get("k117");
}

function f118(x: number): number {
  return x + 119 + f95(x);
}

function f119(x: number): number {
  return x + 120 + f65(x) + f69(x) + clock.now();
}

console.log(f119(Number(process.argv[2] ?? 1)));
