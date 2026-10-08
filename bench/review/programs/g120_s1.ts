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

function f40(x: number): number {
  return x + 41 + f19(x) + f28(x);
}

function f41(x: number): number {
  return x + 42 + f14(x) + f15(x) + f25(x);
}

function f42(x: number): number {
  return x + 43 + f41(x) + f33(x) + f12(x);
}

function f43(x: number): number {
  return x + 44 + f27(x) + clock.now();
}

function f44(x: number): number {
  return x + 45 + f32(x);
}

function f45(x: number): number {
  return x + 46 + f37(x) + f18(x);
}

function f46(x: number): number {
  return x + 47 + f28(x) + f2(x);
}

function f47(x: number): number {
  return x + 48 + f22(x) + clock.now();
}

function f48(x: number): number {
  return x + 49 + f43(x);
}

function f49(x: number): number {
  return x + 50 + f24(x) + f14(x);
}

function f50(x: number): number {
  return x + 51 + f4(x) + f13(x) + f39(x);
}

function f51(x: number): number {
  return x + 52 + f38(x) + f44(x);
}

function f52(x: number): number {
  return x + 53 + f9(x) + f31(x) + f7(x);
}

function f53(x: number): number {
  return x + 54 + f16(x) + f13(x) + clock.now();
}

function f54(x: number): number {
  return x + 55 + f49(x) + f41(x) + net.fetch("u54");
}

function f55(x: number): number {
  return x + 56 + f29(x) + f19(x);
}

function f56(x: number): number {
  return x + 57 + f28(x) + f13(x);
}

function f57(x: number): number {
  return x + 58 + f38(x) + f21(x);
}

function f58(x: number): number {
  return x + 59 + f36(x) + f44(x);
}

function f59(x: number): number {
  return x + 60 + f47(x) + f55(x) + f20(x);
}

function f60(x: number): number {
  return x + 61 + f11(x);
}

function f61(x: number): number {
  return x + 62 + f37(x) + f34(x);
}

function f62(x: number): number {
  return x + 63 + f7(x) + f49(x) + f6(x);
}

function f63(x: number): number {
  return x + 64 + f8(x) + f47(x);
}

function f64(x: number): number {
  return x + 65 + f43(x) + f24(x) + f57(x);
}

function f65(x: number): number {
  return x + 66 + f44(x);
}

function f66(x: number): number {
  return x + 67 + f12(x) + f21(x) + f46(x);
}

function f67(x: number): number {
  return x + 68 + f55(x) + f34(x);
}

function f68(x: number): number {
  return x + 69 + f34(x) + f11(x);
}

function f69(x: number): number {
  return x + 70 + f60(x) + f33(x) + f25(x);
}

function f70(x: number): number {
  return x + 71 + f0(x);
}

function f71(x: number): number {
  return x + 72 + f16(x) + f34(x) + f46(x) + net.fetch("u71");
}

function f72(x: number): number {
  return x + 73 + f63(x);
}

function f73(x: number): number {
  return x + 74 + f32(x) + f56(x);
}

function f74(x: number): number {
  return x + 75 + f15(x) + f9(x);
}

function f75(x: number): number {
  return x + 76 + f54(x) + f29(x) + f33(x);
}

function f76(x: number): number {
  return x + 77 + f63(x);
}

function f77(x: number): number {
  return x + 78 + f27(x) + f70(x) + f17(x);
}

function f78(x: number): number {
  return x + 79 + f65(x) + clock.now();
}

function f79(x: number): number {
  return x + 80 + f64(x) + f62(x) + f48(x);
}

function f80(x: number): number {
  return x + 81 + f40(x) + f21(x) + f49(x);
}

function f81(x: number): number {
  return x + 82 + f13(x) + f66(x) + f47(x) + store.get("k81");
}

function f82(x: number): number {
  return x + 83 + f44(x) + f9(x) + f33(x);
}

function f83(x: number): number {
  return x + 84 + f82(x) + f50(x);
}

function f84(x: number): number {
  return x + 85 + f14(x);
}

function f85(x: number): number {
  return x + 86 + f20(x) + f5(x);
}

function f86(x: number): number {
  return x + 87 + f85(x) + f82(x);
}

function f87(x: number): number {
  return x + 88 + f30(x) + f43(x);
}

function f88(x: number): number {
  return x + 89 + f58(x) + f2(x);
}

function f89(x: number): number {
  return x + 90 + f5(x) + f41(x) + f24(x);
}

function f90(x: number): number {
  return x + 91 + f24(x) + f84(x);
}

function f91(x: number): number {
  return x + 92 + f33(x) + f46(x);
}

function f92(x: number): number {
  return x + 93 + f88(x);
}

function f93(x: number): number {
  return x + 94 + f90(x) + f72(x);
}

function f94(x: number): number {
  return x + 95 + f88(x);
}

function f95(x: number): number {
  return x + 96 + f64(x) + f2(x) + f10(x) + clock.now();
}

function f96(x: number): number {
  return x + 97 + f40(x) + f58(x);
}

function f97(x: number): number {
  return x + 98 + f5(x) + f95(x) + f15(x);
}

function f98(x: number): number {
  return x + 99 + f27(x);
}

function f99(x: number): number {
  return x + 100 + f97(x) + f72(x) + f11(x);
}

function f100(x: number): number {
  return x + 101 + f89(x) + f1(x) + f84(x);
}

function f101(x: number): number {
  return x + 102 + f33(x) + f32(x);
}

function f102(x: number): number {
  return x + 103 + f19(x) + f81(x) + f84(x) + store.get("k102");
}

function f103(x: number): number {
  return x + 104 + f5(x) + f100(x) + f44(x);
}

function f104(x: number): number {
  return x + 105 + f37(x) + f89(x) + f41(x);
}

function f105(x: number): number {
  return x + 106 + f70(x) + f86(x) + f33(x);
}

function f106(x: number): number {
  return x + 107 + f83(x) + f94(x) + f53(x);
}

function f107(x: number): number {
  return x + 108 + f96(x) + f7(x) + f35(x) + store.get("k107");
}

function f108(x: number): number {
  return x + 109 + f78(x) + f39(x) + net.fetch("u108");
}

function f109(x: number): number {
  return x + 110 + f88(x);
}

function f110(x: number): number {
  return x + 111 + f38(x) + f47(x);
}

function f111(x: number): number {
  return x + 112 + f64(x) + f97(x);
}

function f112(x: number): number {
  return x + 113 + f73(x) + f90(x) + f80(x);
}

function f113(x: number): number {
  return x + 114 + f13(x) + f90(x) + f30(x);
}

function f114(x: number): number {
  return x + 115 + f100(x) + f93(x);
}

function f115(x: number): number {
  return x + 116 + f68(x);
}

function f116(x: number): number {
  return x + 117 + f41(x) + f73(x);
}

function f117(x: number): number {
  return x + 118 + f93(x) + f111(x) + f56(x);
}

function f118(x: number): number {
  return x + 119 + f78(x) + f115(x);
}

function f119(x: number): number {
  return x + 120 + f9(x);
}

console.log(f119(Number(process.argv[2] ?? 1)));
