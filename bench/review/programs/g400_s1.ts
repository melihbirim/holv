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

function f120(x: number): number {
  return x + 121 + f96(x);
}

function f121(x: number): number {
  return x + 122 + f78(x) + f111(x);
}

function f122(x: number): number {
  return x + 123 + f86(x);
}

function f123(x: number): number {
  return x + 124 + f82(x);
}

function f124(x: number): number {
  return x + 125 + f36(x);
}

function f125(x: number): number {
  return x + 126 + f51(x) + f20(x) + f50(x) + clock.now();
}

function f126(x: number): number {
  return x + 127 + f102(x) + f76(x);
}

function f127(x: number): number {
  return x + 128 + f11(x);
}

function f128(x: number): number {
  return x + 129 + f67(x) + f3(x) + f95(x);
}

function f129(x: number): number {
  return x + 130 + f102(x) + f91(x);
}

function f130(x: number): number {
  return x + 131 + f115(x);
}

function f131(x: number): number {
  return x + 132 + f123(x) + f40(x) + f5(x);
}

function f132(x: number): number {
  return x + 133 + f57(x);
}

function f133(x: number): number {
  return x + 134 + f41(x);
}

function f134(x: number): number {
  return x + 135 + f112(x) + f109(x) + f115(x);
}

function f135(x: number): number {
  return x + 136 + f18(x) + f89(x) + f1(x) + clock.now();
}

function f136(x: number): number {
  return x + 137 + f17(x) + store.get("k136");
}

function f137(x: number): number {
  return x + 138 + f103(x) + f127(x) + f25(x);
}

function f138(x: number): number {
  return x + 139 + f94(x) + f137(x) + f2(x);
}

function f139(x: number): number {
  return x + 140 + f104(x) + f64(x);
}

function f140(x: number): number {
  return x + 141 + f5(x) + clock.now();
}

function f141(x: number): number {
  return x + 142 + f61(x);
}

function f142(x: number): number {
  return x + 143 + f115(x) + f0(x) + store.get("k142");
}

function f143(x: number): number {
  return x + 144 + f58(x);
}

function f144(x: number): number {
  return x + 145 + f130(x) + f120(x) + f105(x);
}

function f145(x: number): number {
  return x + 146 + f95(x) + f75(x) + store.get("k145");
}

function f146(x: number): number {
  return x + 147 + f60(x) + f45(x);
}

function f147(x: number): number {
  return x + 148 + f73(x) + f42(x) + clock.now();
}

function f148(x: number): number {
  return x + 149 + f2(x) + f1(x);
}

function f149(x: number): number {
  return x + 150 + f67(x);
}

function f150(x: number): number {
  return x + 151 + f37(x) + f125(x) + f113(x);
}

function f151(x: number): number {
  return x + 152 + f131(x) + f98(x) + f15(x) + net.fetch("u151");
}

function f152(x: number): number {
  return x + 153 + f52(x) + f109(x);
}

function f153(x: number): number {
  return x + 154 + f60(x) + f81(x);
}

function f154(x: number): number {
  return x + 155 + f40(x) + f152(x) + f106(x) + store.get("k154");
}

function f155(x: number): number {
  return x + 156 + f106(x) + f24(x) + net.fetch("u155");
}

function f156(x: number): number {
  return x + 157 + f56(x) + f5(x) + f154(x);
}

function f157(x: number): number {
  return x + 158 + f0(x) + f143(x);
}

function f158(x: number): number {
  return x + 159 + f7(x);
}

function f159(x: number): number {
  return x + 160 + f84(x) + f98(x);
}

function f160(x: number): number {
  return x + 161 + f63(x) + f83(x);
}

function f161(x: number): number {
  return x + 162 + f31(x) + store.get("k161");
}

function f162(x: number): number {
  return x + 163 + f32(x) + f24(x);
}

function f163(x: number): number {
  return x + 164 + f31(x) + f37(x) + net.fetch("u163");
}

function f164(x: number): number {
  return x + 165 + f34(x) + f102(x);
}

function f165(x: number): number {
  return x + 166 + f65(x) + f72(x) + f58(x);
}

function f166(x: number): number {
  return x + 167 + f97(x) + f68(x);
}

function f167(x: number): number {
  return x + 168 + f119(x);
}

function f168(x: number): number {
  return x + 169 + f83(x);
}

function f169(x: number): number {
  return x + 170 + f43(x) + f57(x) + f121(x);
}

function f170(x: number): number {
  return x + 171 + f80(x);
}

function f171(x: number): number {
  return x + 172 + f52(x) + f81(x) + f114(x);
}

function f172(x: number): number {
  return x + 173 + f19(x);
}

function f173(x: number): number {
  return x + 174 + f54(x) + f161(x) + clock.now();
}

function f174(x: number): number {
  return x + 175 + f0(x) + f24(x) + f28(x) + clock.now();
}

function f175(x: number): number {
  return x + 176 + f51(x) + f140(x) + f81(x);
}

function f176(x: number): number {
  return x + 177 + f72(x);
}

function f177(x: number): number {
  return x + 178 + f70(x);
}

function f178(x: number): number {
  return x + 179 + f168(x) + f74(x);
}

function f179(x: number): number {
  return x + 180 + f37(x);
}

function f180(x: number): number {
  return x + 181 + f166(x) + f80(x) + f82(x);
}

function f181(x: number): number {
  return x + 182 + f87(x) + clock.now();
}

function f182(x: number): number {
  return x + 183 + f58(x);
}

function f183(x: number): number {
  return x + 184 + f111(x) + f138(x) + f154(x);
}

function f184(x: number): number {
  return x + 185 + f61(x);
}

function f185(x: number): number {
  return x + 186 + f10(x) + clock.now();
}

function f186(x: number): number {
  return x + 187 + f12(x);
}

function f187(x: number): number {
  return x + 188 + f129(x) + store.get("k187");
}

function f188(x: number): number {
  return x + 189 + f78(x);
}

function f189(x: number): number {
  return x + 190 + f92(x) + f35(x) + f110(x);
}

function f190(x: number): number {
  return x + 191 + f149(x);
}

function f191(x: number): number {
  return x + 192 + f108(x) + f33(x) + f97(x);
}

function f192(x: number): number {
  return x + 193 + f17(x);
}

function f193(x: number): number {
  return x + 194 + f189(x) + f114(x);
}

function f194(x: number): number {
  return x + 195 + f16(x) + clock.now();
}

function f195(x: number): number {
  return x + 196 + f110(x);
}

function f196(x: number): number {
  return x + 197 + f36(x);
}

function f197(x: number): number {
  return x + 198 + f181(x) + f129(x) + store.get("k197");
}

function f198(x: number): number {
  return x + 199 + f81(x) + f20(x);
}

function f199(x: number): number {
  return x + 200 + f164(x);
}

function f200(x: number): number {
  return x + 201 + f155(x);
}

function f201(x: number): number {
  return x + 202 + f155(x);
}

function f202(x: number): number {
  return x + 203 + f55(x) + f57(x);
}

function f203(x: number): number {
  return x + 204 + f129(x) + f99(x);
}

function f204(x: number): number {
  return x + 205 + f107(x);
}

function f205(x: number): number {
  return x + 206 + f65(x);
}

function f206(x: number): number {
  return x + 207 + f74(x) + f143(x) + f193(x);
}

function f207(x: number): number {
  return x + 208 + f191(x) + f154(x);
}

function f208(x: number): number {
  return x + 209 + f170(x) + f149(x) + f82(x);
}

function f209(x: number): number {
  return x + 210 + f128(x) + f187(x);
}

function f210(x: number): number {
  return x + 211 + f75(x);
}

function f211(x: number): number {
  return x + 212 + f50(x) + f167(x) + f129(x);
}

function f212(x: number): number {
  return x + 213 + f152(x);
}

function f213(x: number): number {
  return x + 214 + f167(x) + f75(x) + f141(x);
}

function f214(x: number): number {
  return x + 215 + f202(x) + f99(x) + clock.now();
}

function f215(x: number): number {
  return x + 216 + f152(x);
}

function f216(x: number): number {
  return x + 217 + f33(x) + f143(x) + f24(x);
}

function f217(x: number): number {
  return x + 218 + f141(x);
}

function f218(x: number): number {
  return x + 219 + f212(x) + f18(x) + f195(x) + store.get("k218");
}

function f219(x: number): number {
  return x + 220 + f187(x) + f176(x);
}

function f220(x: number): number {
  return x + 221 + f187(x) + f131(x);
}

function f221(x: number): number {
  return x + 222 + f141(x) + f164(x) + f83(x);
}

function f222(x: number): number {
  return x + 223 + f37(x) + f209(x) + f141(x);
}

function f223(x: number): number {
  return x + 224 + f196(x) + f213(x);
}

function f224(x: number): number {
  return x + 225 + f32(x) + clock.now();
}

function f225(x: number): number {
  return x + 226 + f130(x);
}

function f226(x: number): number {
  return x + 227 + f110(x) + store.get("k226");
}

function f227(x: number): number {
  return x + 228 + f140(x);
}

function f228(x: number): number {
  return x + 229 + f208(x) + net.fetch("u228");
}

function f229(x: number): number {
  return x + 230 + f46(x) + clock.now();
}

function f230(x: number): number {
  return x + 231 + f24(x);
}

function f231(x: number): number {
  return x + 232 + f204(x) + f189(x) + f41(x);
}

function f232(x: number): number {
  return x + 233 + f61(x);
}

function f233(x: number): number {
  return x + 234 + f50(x) + f208(x);
}

function f234(x: number): number {
  return x + 235 + f162(x);
}

function f235(x: number): number {
  return x + 236 + f15(x) + f93(x) + f81(x);
}

function f236(x: number): number {
  return x + 237 + f139(x);
}

function f237(x: number): number {
  return x + 238 + f183(x) + f230(x) + store.get("k237");
}

function f238(x: number): number {
  return x + 239 + f202(x) + f97(x);
}

function f239(x: number): number {
  return x + 240 + f35(x) + f178(x);
}

function f240(x: number): number {
  return x + 241 + f55(x) + f9(x);
}

function f241(x: number): number {
  return x + 242 + f203(x) + f120(x) + f61(x) + net.fetch("u241");
}

function f242(x: number): number {
  return x + 243 + f23(x) + f139(x) + f68(x);
}

function f243(x: number): number {
  return x + 244 + f159(x);
}

function f244(x: number): number {
  return x + 245 + f52(x) + clock.now();
}

function f245(x: number): number {
  return x + 246 + f128(x) + f67(x);
}

function f246(x: number): number {
  return x + 247 + f228(x) + f200(x) + f125(x);
}

function f247(x: number): number {
  return x + 248 + f190(x);
}

function f248(x: number): number {
  return x + 249 + f236(x);
}

function f249(x: number): number {
  return x + 250 + f109(x) + f87(x) + f98(x);
}

function f250(x: number): number {
  return x + 251 + f37(x);
}

function f251(x: number): number {
  return x + 252 + f42(x) + f231(x) + f39(x);
}

function f252(x: number): number {
  return x + 253 + f213(x) + clock.now();
}

function f253(x: number): number {
  return x + 254 + f249(x);
}

function f254(x: number): number {
  return x + 255 + f187(x) + f69(x) + f206(x);
}

function f255(x: number): number {
  return x + 256 + f127(x) + f160(x) + f212(x);
}

function f256(x: number): number {
  return x + 257 + f186(x);
}

function f257(x: number): number {
  return x + 258 + f7(x) + f139(x);
}

function f258(x: number): number {
  return x + 259 + f144(x) + f109(x);
}

function f259(x: number): number {
  return x + 260 + f150(x);
}

function f260(x: number): number {
  return x + 261 + f210(x) + f225(x) + f1(x) + store.get("k260");
}

function f261(x: number): number {
  return x + 262 + f105(x) + f5(x);
}

function f262(x: number): number {
  return x + 263 + f154(x);
}

function f263(x: number): number {
  return x + 264 + f73(x) + f203(x) + f49(x);
}

function f264(x: number): number {
  return x + 265 + f178(x);
}

function f265(x: number): number {
  return x + 266 + f213(x) + f128(x);
}

function f266(x: number): number {
  return x + 267 + f180(x) + f86(x) + f57(x) + clock.now();
}

function f267(x: number): number {
  return x + 268 + f175(x);
}

function f268(x: number): number {
  return x + 269 + f40(x) + f84(x) + f250(x) + clock.now();
}

function f269(x: number): number {
  return x + 270 + f118(x) + f70(x) + net.fetch("u269");
}

function f270(x: number): number {
  return x + 271 + f135(x) + f4(x);
}

function f271(x: number): number {
  return x + 272 + f199(x);
}

function f272(x: number): number {
  return x + 273 + f121(x) + f197(x) + f245(x);
}

function f273(x: number): number {
  return x + 274 + f170(x);
}

function f274(x: number): number {
  return x + 275 + f53(x);
}

function f275(x: number): number {
  return x + 276 + f48(x) + f142(x) + f210(x);
}

function f276(x: number): number {
  return x + 277 + f176(x) + f47(x) + f116(x);
}

function f277(x: number): number {
  return x + 278 + f177(x) + f107(x);
}

function f278(x: number): number {
  return x + 279 + f41(x) + f101(x) + f204(x) + store.get("k278");
}

function f279(x: number): number {
  return x + 280 + f241(x) + f220(x);
}

function f280(x: number): number {
  return x + 281 + f100(x);
}

function f281(x: number): number {
  return x + 282 + f180(x);
}

function f282(x: number): number {
  return x + 283 + f60(x);
}

function f283(x: number): number {
  return x + 284 + f172(x) + f184(x);
}

function f284(x: number): number {
  return x + 285 + f79(x) + f278(x) + f74(x) + store.get("k284");
}

function f285(x: number): number {
  return x + 286 + f67(x) + f4(x) + f48(x);
}

function f286(x: number): number {
  return x + 287 + f211(x);
}

function f287(x: number): number {
  return x + 288 + f180(x) + f101(x) + f257(x);
}

function f288(x: number): number {
  return x + 289 + f236(x) + f199(x);
}

function f289(x: number): number {
  return x + 290 + f193(x) + f281(x) + store.get("k289");
}

function f290(x: number): number {
  return x + 291 + f228(x) + f273(x) + f283(x) + clock.now();
}

function f291(x: number): number {
  return x + 292 + f94(x) + clock.now();
}

function f292(x: number): number {
  return x + 293 + f154(x) + f168(x) + f129(x);
}

function f293(x: number): number {
  return x + 294 + f146(x) + f15(x);
}

function f294(x: number): number {
  return x + 295 + f76(x) + f169(x) + f125(x);
}

function f295(x: number): number {
  return x + 296 + f269(x) + f26(x);
}

function f296(x: number): number {
  return x + 297 + f187(x);
}

function f297(x: number): number {
  return x + 298 + f80(x) + f126(x);
}

function f298(x: number): number {
  return x + 299 + f126(x) + f25(x);
}

function f299(x: number): number {
  return x + 300 + f128(x) + f214(x) + f239(x) + net.fetch("u299");
}

function f300(x: number): number {
  return x + 301 + f230(x);
}

function f301(x: number): number {
  return x + 302 + f156(x) + f154(x);
}

function f302(x: number): number {
  return x + 303 + f70(x) + f178(x);
}

function f303(x: number): number {
  return x + 304 + f218(x) + f252(x) + f210(x) + clock.now();
}

function f304(x: number): number {
  return x + 305 + f100(x);
}

function f305(x: number): number {
  return x + 306 + f209(x);
}

function f306(x: number): number {
  return x + 307 + f166(x) + f223(x);
}

function f307(x: number): number {
  return x + 308 + f19(x) + f210(x);
}

function f308(x: number): number {
  return x + 309 + f176(x) + f95(x) + f52(x);
}

function f309(x: number): number {
  return x + 310 + f115(x) + f245(x) + f42(x);
}

function f310(x: number): number {
  return x + 311 + f232(x) + f63(x) + f35(x);
}

function f311(x: number): number {
  return x + 312 + f200(x) + f6(x);
}

function f312(x: number): number {
  return x + 313 + f179(x) + f53(x) + f83(x);
}

function f313(x: number): number {
  return x + 314 + f165(x) + f34(x) + f65(x);
}

function f314(x: number): number {
  return x + 315 + f307(x) + f256(x) + f56(x);
}

function f315(x: number): number {
  return x + 316 + f105(x) + f196(x);
}

function f316(x: number): number {
  return x + 317 + f220(x);
}

function f317(x: number): number {
  return x + 318 + f73(x) + f146(x) + f72(x);
}

function f318(x: number): number {
  return x + 319 + f288(x) + f35(x) + f59(x);
}

function f319(x: number): number {
  return x + 320 + f177(x);
}

function f320(x: number): number {
  return x + 321 + f2(x) + f240(x);
}

function f321(x: number): number {
  return x + 322 + f9(x) + store.get("k321");
}

function f322(x: number): number {
  return x + 323 + f128(x) + net.fetch("u322");
}

function f323(x: number): number {
  return x + 324 + f303(x);
}

function f324(x: number): number {
  return x + 325 + f173(x) + f213(x) + f323(x);
}

function f325(x: number): number {
  return x + 326 + f10(x) + f55(x);
}

function f326(x: number): number {
  return x + 327 + f246(x);
}

function f327(x: number): number {
  return x + 328 + f57(x) + net.fetch("u327");
}

function f328(x: number): number {
  return x + 329 + f59(x) + net.fetch("u328");
}

function f329(x: number): number {
  return x + 330 + f42(x) + net.fetch("u329");
}

function f330(x: number): number {
  return x + 331 + f307(x);
}

function f331(x: number): number {
  return x + 332 + f270(x) + f276(x);
}

function f332(x: number): number {
  return x + 333 + f97(x) + f264(x) + f280(x);
}

function f333(x: number): number {
  return x + 334 + f246(x) + f252(x) + f107(x);
}

function f334(x: number): number {
  return x + 335 + f79(x) + f261(x) + f55(x);
}

function f335(x: number): number {
  return x + 336 + f55(x) + f59(x);
}

function f336(x: number): number {
  return x + 337 + f99(x);
}

function f337(x: number): number {
  return x + 338 + f24(x) + f270(x);
}

function f338(x: number): number {
  return x + 339 + f8(x) + f284(x);
}

function f339(x: number): number {
  return x + 340 + f137(x);
}

function f340(x: number): number {
  return x + 341 + f317(x) + f294(x);
}

function f341(x: number): number {
  return x + 342 + f228(x) + f217(x) + store.get("k341");
}

function f342(x: number): number {
  return x + 343 + f218(x) + f9(x) + f302(x);
}

function f343(x: number): number {
  return x + 344 + f244(x) + f197(x);
}

function f344(x: number): number {
  return x + 345 + f58(x) + f95(x) + f261(x);
}

function f345(x: number): number {
  return x + 346 + f9(x);
}

function f346(x: number): number {
  return x + 347 + f262(x);
}

function f347(x: number): number {
  return x + 348 + f258(x) + f150(x) + f120(x) + net.fetch("u347");
}

function f348(x: number): number {
  return x + 349 + f244(x) + f165(x) + f130(x) + net.fetch("u348");
}

function f349(x: number): number {
  return x + 350 + f71(x) + f78(x) + f290(x);
}

function f350(x: number): number {
  return x + 351 + f154(x) + f57(x) + f302(x);
}

function f351(x: number): number {
  return x + 352 + f124(x) + f120(x);
}

function f352(x: number): number {
  return x + 353 + f250(x) + f141(x) + f282(x);
}

function f353(x: number): number {
  return x + 354 + f139(x) + f168(x) + f120(x);
}

function f354(x: number): number {
  return x + 355 + f50(x) + f346(x);
}

function f355(x: number): number {
  return x + 356 + f133(x) + f23(x) + f60(x);
}

function f356(x: number): number {
  return x + 357 + f131(x);
}

function f357(x: number): number {
  return x + 358 + f82(x) + f324(x) + f333(x);
}

function f358(x: number): number {
  return x + 359 + f74(x);
}

function f359(x: number): number {
  return x + 360 + f60(x) + f217(x) + clock.now();
}

function f360(x: number): number {
  return x + 361 + f131(x) + f150(x);
}

function f361(x: number): number {
  return x + 362 + f229(x) + f292(x) + f124(x);
}

function f362(x: number): number {
  return x + 363 + f353(x) + f18(x);
}

function f363(x: number): number {
  return x + 364 + f90(x) + f113(x) + f207(x);
}

function f364(x: number): number {
  return x + 365 + f136(x);
}

function f365(x: number): number {
  return x + 366 + f74(x);
}

function f366(x: number): number {
  return x + 367 + f29(x);
}

function f367(x: number): number {
  return x + 368 + f195(x);
}

function f368(x: number): number {
  return x + 369 + f300(x) + f109(x) + f120(x);
}

function f369(x: number): number {
  return x + 370 + f112(x) + f217(x) + f150(x) + store.get("k369");
}

function f370(x: number): number {
  return x + 371 + f244(x) + f291(x);
}

function f371(x: number): number {
  return x + 372 + f271(x) + store.get("k371");
}

function f372(x: number): number {
  return x + 373 + f346(x) + f172(x);
}

function f373(x: number): number {
  return x + 374 + f228(x) + f363(x);
}

function f374(x: number): number {
  return x + 375 + f352(x) + f115(x) + f0(x);
}

function f375(x: number): number {
  return x + 376 + f25(x);
}

function f376(x: number): number {
  return x + 377 + f346(x) + f316(x);
}

function f377(x: number): number {
  return x + 378 + f82(x) + net.fetch("u377");
}

function f378(x: number): number {
  return x + 379 + f32(x) + f122(x);
}

function f379(x: number): number {
  return x + 380 + f27(x) + f246(x) + f131(x);
}

function f380(x: number): number {
  return x + 381 + f220(x);
}

function f381(x: number): number {
  return x + 382 + f53(x) + f84(x) + f248(x);
}

function f382(x: number): number {
  return x + 383 + f330(x) + f264(x) + f194(x);
}

function f383(x: number): number {
  return x + 384 + f130(x) + f75(x) + net.fetch("u383");
}

function f384(x: number): number {
  return x + 385 + f292(x) + net.fetch("u384");
}

function f385(x: number): number {
  return x + 386 + f101(x) + store.get("k385");
}

function f386(x: number): number {
  return x + 387 + f123(x) + f213(x) + f274(x);
}

function f387(x: number): number {
  return x + 388 + f184(x);
}

function f388(x: number): number {
  return x + 389 + f319(x) + f32(x) + f108(x);
}

function f389(x: number): number {
  return x + 390 + f375(x) + store.get("k389");
}

function f390(x: number): number {
  return x + 391 + f166(x) + f0(x);
}

function f391(x: number): number {
  return x + 392 + f228(x) + f346(x) + f285(x);
}

function f392(x: number): number {
  return x + 393 + f358(x) + f94(x);
}

function f393(x: number): number {
  return x + 394 + f160(x) + f291(x) + f212(x);
}

function f394(x: number): number {
  return x + 395 + f313(x) + f224(x);
}

function f395(x: number): number {
  return x + 396 + f94(x) + f329(x) + f29(x);
}

function f396(x: number): number {
  return x + 397 + f140(x) + f21(x);
}

function f397(x: number): number {
  return x + 398 + f220(x) + f100(x) + f363(x) + clock.now();
}

function f398(x: number): number {
  return x + 399 + f117(x) + f34(x);
}

function f399(x: number): number {
  return x + 400 + f217(x) + f185(x);
}

console.log(f399(Number(process.argv[2] ?? 1)));
