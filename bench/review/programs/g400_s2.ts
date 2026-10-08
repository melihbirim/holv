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

function f120(x: number): number {
  return x + 121 + f44(x) + f54(x) + f66(x);
}

function f121(x: number): number {
  return x + 122 + f105(x) + f2(x) + net.fetch("u121");
}

function f122(x: number): number {
  return x + 123 + f17(x) + net.fetch("u122");
}

function f123(x: number): number {
  return x + 124 + f115(x) + f12(x) + f19(x);
}

function f124(x: number): number {
  return x + 125 + f68(x);
}

function f125(x: number): number {
  return x + 126 + f26(x);
}

function f126(x: number): number {
  return x + 127 + f101(x) + f30(x) + f119(x) + net.fetch("u126");
}

function f127(x: number): number {
  return x + 128 + f68(x);
}

function f128(x: number): number {
  return x + 129 + f113(x) + f71(x);
}

function f129(x: number): number {
  return x + 130 + f49(x) + f103(x);
}

function f130(x: number): number {
  return x + 131 + f73(x);
}

function f131(x: number): number {
  return x + 132 + f99(x) + f68(x) + f56(x);
}

function f132(x: number): number {
  return x + 133 + f52(x) + f127(x) + f125(x);
}

function f133(x: number): number {
  return x + 134 + f3(x) + f15(x);
}

function f134(x: number): number {
  return x + 135 + f124(x) + f76(x);
}

function f135(x: number): number {
  return x + 136 + f33(x) + f4(x);
}

function f136(x: number): number {
  return x + 137 + f88(x) + f129(x) + f80(x) + store.get("k136");
}

function f137(x: number): number {
  return x + 138 + f15(x) + f73(x) + f30(x) + net.fetch("u137");
}

function f138(x: number): number {
  return x + 139 + f60(x) + f90(x) + store.get("k138");
}

function f139(x: number): number {
  return x + 140 + f102(x) + f132(x);
}

function f140(x: number): number {
  return x + 141 + f26(x) + f16(x) + net.fetch("u140");
}

function f141(x: number): number {
  return x + 142 + f13(x) + f0(x) + f94(x);
}

function f142(x: number): number {
  return x + 143 + f125(x) + f134(x);
}

function f143(x: number): number {
  return x + 144 + f135(x);
}

function f144(x: number): number {
  return x + 145 + f11(x) + f134(x) + f131(x);
}

function f145(x: number): number {
  return x + 146 + f108(x) + f144(x);
}

function f146(x: number): number {
  return x + 147 + f101(x) + f113(x);
}

function f147(x: number): number {
  return x + 148 + f96(x) + clock.now();
}

function f148(x: number): number {
  return x + 149 + f118(x) + f82(x) + clock.now();
}

function f149(x: number): number {
  return x + 150 + f37(x) + f122(x) + f107(x);
}

function f150(x: number): number {
  return x + 151 + f122(x) + f59(x) + f40(x);
}

function f151(x: number): number {
  return x + 152 + f47(x) + f118(x) + f44(x);
}

function f152(x: number): number {
  return x + 153 + f148(x) + f91(x);
}

function f153(x: number): number {
  return x + 154 + f22(x) + f125(x) + f0(x);
}

function f154(x: number): number {
  return x + 155 + f83(x) + f82(x) + f20(x) + store.get("k154");
}

function f155(x: number): number {
  return x + 156 + f3(x) + f10(x) + f18(x);
}

function f156(x: number): number {
  return x + 157 + f15(x) + f31(x);
}

function f157(x: number): number {
  return x + 158 + f15(x) + f45(x);
}

function f158(x: number): number {
  return x + 159 + f114(x) + net.fetch("u158");
}

function f159(x: number): number {
  return x + 160 + f53(x) + f52(x);
}

function f160(x: number): number {
  return x + 161 + f119(x) + f67(x);
}

function f161(x: number): number {
  return x + 162 + f48(x);
}

function f162(x: number): number {
  return x + 163 + f116(x) + f98(x);
}

function f163(x: number): number {
  return x + 164 + f54(x) + f158(x) + f128(x);
}

function f164(x: number): number {
  return x + 165 + f76(x) + f26(x) + f10(x);
}

function f165(x: number): number {
  return x + 166 + f125(x);
}

function f166(x: number): number {
  return x + 167 + f14(x) + f150(x);
}

function f167(x: number): number {
  return x + 168 + f136(x);
}

function f168(x: number): number {
  return x + 169 + f1(x);
}

function f169(x: number): number {
  return x + 170 + f146(x) + f80(x) + f70(x);
}

function f170(x: number): number {
  return x + 171 + f1(x) + f150(x) + f37(x);
}

function f171(x: number): number {
  return x + 172 + f20(x) + clock.now();
}

function f172(x: number): number {
  return x + 173 + f28(x) + f131(x);
}

function f173(x: number): number {
  return x + 174 + f7(x);
}

function f174(x: number): number {
  return x + 175 + f93(x);
}

function f175(x: number): number {
  return x + 176 + f122(x) + f140(x) + f67(x);
}

function f176(x: number): number {
  return x + 177 + f51(x);
}

function f177(x: number): number {
  return x + 178 + f65(x) + f60(x);
}

function f178(x: number): number {
  return x + 179 + f72(x) + f68(x) + f5(x);
}

function f179(x: number): number {
  return x + 180 + f113(x) + f32(x) + f93(x);
}

function f180(x: number): number {
  return x + 181 + f150(x) + f110(x) + f98(x) + store.get("k180");
}

function f181(x: number): number {
  return x + 182 + f62(x);
}

function f182(x: number): number {
  return x + 183 + f1(x) + f85(x) + f58(x);
}

function f183(x: number): number {
  return x + 184 + f42(x) + f152(x) + f39(x);
}

function f184(x: number): number {
  return x + 185 + f36(x) + f136(x);
}

function f185(x: number): number {
  return x + 186 + f137(x) + f164(x) + f95(x) + clock.now();
}

function f186(x: number): number {
  return x + 187 + f105(x) + f17(x) + f7(x);
}

function f187(x: number): number {
  return x + 188 + f130(x) + f177(x) + f153(x);
}

function f188(x: number): number {
  return x + 189 + f59(x) + f113(x) + f100(x);
}

function f189(x: number): number {
  return x + 190 + f66(x) + f82(x) + f39(x);
}

function f190(x: number): number {
  return x + 191 + f165(x) + net.fetch("u190");
}

function f191(x: number): number {
  return x + 192 + f161(x);
}

function f192(x: number): number {
  return x + 193 + f0(x) + f43(x) + net.fetch("u192");
}

function f193(x: number): number {
  return x + 194 + f70(x) + f124(x);
}

function f194(x: number): number {
  return x + 195 + f132(x) + f69(x);
}

function f195(x: number): number {
  return x + 196 + f72(x) + f4(x) + f61(x) + net.fetch("u195");
}

function f196(x: number): number {
  return x + 197 + f188(x) + f83(x);
}

function f197(x: number): number {
  return x + 198 + f15(x);
}

function f198(x: number): number {
  return x + 199 + f59(x) + f119(x) + f39(x);
}

function f199(x: number): number {
  return x + 200 + f111(x);
}

function f200(x: number): number {
  return x + 201 + f167(x);
}

function f201(x: number): number {
  return x + 202 + f78(x) + f50(x) + f112(x);
}

function f202(x: number): number {
  return x + 203 + f20(x);
}

function f203(x: number): number {
  return x + 204 + f184(x) + f191(x) + f159(x);
}

function f204(x: number): number {
  return x + 205 + f140(x) + f20(x);
}

function f205(x: number): number {
  return x + 206 + f198(x);
}

function f206(x: number): number {
  return x + 207 + f136(x) + f133(x) + f139(x);
}

function f207(x: number): number {
  return x + 208 + f186(x) + f81(x);
}

function f208(x: number): number {
  return x + 209 + f115(x);
}

function f209(x: number): number {
  return x + 210 + f102(x) + f152(x);
}

function f210(x: number): number {
  return x + 211 + f10(x) + f177(x) + f53(x);
}

function f211(x: number): number {
  return x + 212 + f126(x);
}

function f212(x: number): number {
  return x + 213 + f168(x) + f102(x) + store.get("k212");
}

function f213(x: number): number {
  return x + 214 + f189(x) + f148(x);
}

function f214(x: number): number {
  return x + 215 + f202(x);
}

function f215(x: number): number {
  return x + 216 + f164(x) + f125(x);
}

function f216(x: number): number {
  return x + 217 + f47(x) + f107(x) + f205(x);
}

function f217(x: number): number {
  return x + 218 + f214(x) + f50(x) + f193(x);
}

function f218(x: number): number {
  return x + 219 + f179(x) + f71(x) + f18(x);
}

function f219(x: number): number {
  return x + 220 + f57(x) + f201(x);
}

function f220(x: number): number {
  return x + 221 + f18(x);
}

function f221(x: number): number {
  return x + 222 + f2(x);
}

function f222(x: number): number {
  return x + 223 + f76(x);
}

function f223(x: number): number {
  return x + 224 + f205(x) + f126(x) + f157(x);
}

function f224(x: number): number {
  return x + 225 + f160(x) + f139(x) + clock.now();
}

function f225(x: number): number {
  return x + 226 + f86(x) + f210(x) + f146(x);
}

function f226(x: number): number {
  return x + 227 + f6(x) + f211(x);
}

function f227(x: number): number {
  return x + 228 + f102(x);
}

function f228(x: number): number {
  return x + 229 + f220(x) + f6(x) + f154(x);
}

function f229(x: number): number {
  return x + 230 + f40(x) + f129(x) + f76(x) + net.fetch("u229");
}

function f230(x: number): number {
  return x + 231 + f162(x);
}

function f231(x: number): number {
  return x + 232 + f213(x) + f18(x) + f229(x);
}

function f232(x: number): number {
  return x + 233 + f191(x) + f74(x) + f6(x) + clock.now();
}

function f233(x: number): number {
  return x + 234 + f90(x) + f135(x);
}

function f234(x: number): number {
  return x + 235 + f169(x) + store.get("k234");
}

function f235(x: number): number {
  return x + 236 + f0(x);
}

function f236(x: number): number {
  return x + 237 + f183(x) + f203(x);
}

function f237(x: number): number {
  return x + 238 + f221(x) + f188(x) + f150(x);
}

function f238(x: number): number {
  return x + 239 + f75(x);
}

function f239(x: number): number {
  return x + 240 + f36(x);
}

function f240(x: number): number {
  return x + 241 + f144(x) + f176(x);
}

function f241(x: number): number {
  return x + 242 + f122(x) + f61(x);
}

function f242(x: number): number {
  return x + 243 + f219(x) + f161(x) + f108(x);
}

function f243(x: number): number {
  return x + 244 + f51(x) + f132(x);
}

function f244(x: number): number {
  return x + 245 + f29(x);
}

function f245(x: number): number {
  return x + 246 + f154(x) + net.fetch("u245");
}

function f246(x: number): number {
  return x + 247 + f178(x) + f157(x);
}

function f247(x: number): number {
  return x + 248 + f220(x) + f232(x) + f57(x);
}

function f248(x: number): number {
  return x + 249 + f85(x) + f148(x);
}

function f249(x: number): number {
  return x + 250 + f109(x) + f239(x);
}

function f250(x: number): number {
  return x + 251 + f8(x) + f171(x) + f220(x);
}

function f251(x: number): number {
  return x + 252 + f34(x) + f7(x) + f225(x);
}

function f252(x: number): number {
  return x + 253 + f125(x) + f137(x) + f155(x) + clock.now();
}

function f253(x: number): number {
  return x + 254 + f63(x);
}

function f254(x: number): number {
  return x + 255 + f60(x) + f251(x);
}

function f255(x: number): number {
  return x + 256 + f238(x) + f222(x) + f47(x);
}

function f256(x: number): number {
  return x + 257 + f138(x) + f191(x) + store.get("k256");
}

function f257(x: number): number {
  return x + 258 + f56(x) + f30(x);
}

function f258(x: number): number {
  return x + 259 + f56(x) + f43(x);
}

function f259(x: number): number {
  return x + 260 + f45(x);
}

function f260(x: number): number {
  return x + 261 + f180(x);
}

function f261(x: number): number {
  return x + 262 + f1(x) + net.fetch("u261");
}

function f262(x: number): number {
  return x + 263 + f134(x) + f175(x);
}

function f263(x: number): number {
  return x + 264 + f40(x) + f17(x) + store.get("k263");
}

function f264(x: number): number {
  return x + 265 + f52(x) + f90(x) + clock.now();
}

function f265(x: number): number {
  return x + 266 + f137(x);
}

function f266(x: number): number {
  return x + 267 + f29(x) + f49(x) + f102(x) + net.fetch("u266");
}

function f267(x: number): number {
  return x + 268 + f40(x);
}

function f268(x: number): number {
  return x + 269 + f215(x) + f157(x) + f238(x);
}

function f269(x: number): number {
  return x + 270 + f182(x);
}

function f270(x: number): number {
  return x + 271 + f133(x);
}

function f271(x: number): number {
  return x + 272 + f186(x) + f78(x);
}

function f272(x: number): number {
  return x + 273 + f84(x);
}

function f273(x: number): number {
  return x + 274 + f184(x) + f185(x) + f209(x);
}

function f274(x: number): number {
  return x + 275 + f67(x);
}

function f275(x: number): number {
  return x + 276 + f248(x) + f202(x);
}

function f276(x: number): number {
  return x + 277 + f234(x) + f257(x);
}

function f277(x: number): number {
  return x + 278 + f45(x) + f193(x);
}

function f278(x: number): number {
  return x + 279 + f208(x) + f83(x) + store.get("k278");
}

function f279(x: number): number {
  return x + 280 + f142(x) + f39(x) + f223(x) + clock.now();
}

function f280(x: number): number {
  return x + 281 + f253(x);
}

function f281(x: number): number {
  return x + 282 + f237(x) + net.fetch("u281");
}

function f282(x: number): number {
  return x + 283 + f29(x) + f44(x);
}

function f283(x: number): number {
  return x + 284 + f206(x) + f160(x) + f274(x);
}

function f284(x: number): number {
  return x + 285 + f238(x) + f207(x) + clock.now();
}

function f285(x: number): number {
  return x + 286 + f65(x) + f240(x);
}

function f286(x: number): number {
  return x + 287 + f177(x) + f92(x) + net.fetch("u286");
}

function f287(x: number): number {
  return x + 288 + f243(x);
}

function f288(x: number): number {
  return x + 289 + f6(x);
}

function f289(x: number): number {
  return x + 290 + f258(x) + f186(x);
}

function f290(x: number): number {
  return x + 291 + f213(x) + f86(x);
}

function f291(x: number): number {
  return x + 292 + f29(x) + f98(x) + f50(x) + store.get("k291");
}

function f292(x: number): number {
  return x + 293 + f287(x);
}

function f293(x: number): number {
  return x + 294 + f198(x) + f61(x) + net.fetch("u293");
}

function f294(x: number): number {
  return x + 295 + f274(x) + f235(x);
}

function f295(x: number): number {
  return x + 296 + f119(x) + f282(x) + f256(x);
}

function f296(x: number): number {
  return x + 297 + f159(x);
}

function f297(x: number): number {
  return x + 298 + f247(x) + store.get("k297");
}

function f298(x: number): number {
  return x + 299 + f267(x) + f214(x) + f107(x);
}

function f299(x: number): number {
  return x + 300 + f163(x);
}

function f300(x: number): number {
  return x + 301 + f80(x);
}

function f301(x: number): number {
  return x + 302 + f125(x) + f184(x) + f59(x);
}

function f302(x: number): number {
  return x + 303 + f50(x) + clock.now();
}

function f303(x: number): number {
  return x + 304 + f207(x);
}

function f304(x: number): number {
  return x + 305 + f99(x) + f34(x) + f131(x);
}

function f305(x: number): number {
  return x + 306 + f208(x);
}

function f306(x: number): number {
  return x + 307 + f179(x) + f54(x) + f239(x);
}

function f307(x: number): number {
  return x + 308 + f2(x) + f292(x) + f253(x);
}

function f308(x: number): number {
  return x + 309 + f277(x);
}

function f309(x: number): number {
  return x + 310 + f8(x) + f208(x);
}

function f310(x: number): number {
  return x + 311 + f266(x);
}

function f311(x: number): number {
  return x + 312 + f300(x);
}

function f312(x: number): number {
  return x + 313 + f0(x);
}

function f313(x: number): number {
  return x + 314 + f225(x) + f92(x) + f168(x);
}

function f314(x: number): number {
  return x + 315 + f188(x) + f36(x);
}

function f315(x: number): number {
  return x + 316 + f126(x);
}

function f316(x: number): number {
  return x + 317 + f312(x) + f260(x) + net.fetch("u316");
}

function f317(x: number): number {
  return x + 318 + f168(x);
}

function f318(x: number): number {
  return x + 319 + f99(x);
}

function f319(x: number): number {
  return x + 320 + f276(x);
}

function f320(x: number): number {
  return x + 321 + f22(x) + f192(x) + f122(x) + store.get("k320");
}

function f321(x: number): number {
  return x + 322 + f255(x);
}

function f322(x: number): number {
  return x + 323 + f278(x) + f253(x);
}

function f323(x: number): number {
  return x + 324 + f39(x) + f229(x);
}

function f324(x: number): number {
  return x + 325 + f92(x) + f251(x) + f96(x);
}

function f325(x: number): number {
  return x + 326 + f218(x) + f288(x) + f35(x);
}

function f326(x: number): number {
  return x + 327 + f63(x) + f233(x) + f17(x);
}

function f327(x: number): number {
  return x + 328 + f68(x) + f162(x) + f190(x);
}

function f328(x: number): number {
  return x + 329 + f146(x);
}

function f329(x: number): number {
  return x + 330 + f179(x) + f235(x);
}

function f330(x: number): number {
  return x + 331 + f320(x) + clock.now();
}

function f331(x: number): number {
  return x + 332 + f188(x) + f273(x) + f289(x) + clock.now();
}

function f332(x: number): number {
  return x + 333 + f149(x);
}

function f333(x: number): number {
  return x + 334 + f198(x) + f68(x) + f264(x);
}

function f334(x: number): number {
  return x + 335 + f256(x) + store.get("k334");
}

function f335(x: number): number {
  return x + 336 + f59(x) + f81(x);
}

function f336(x: number): number {
  return x + 337 + f141(x) + f214(x);
}

function f337(x: number): number {
  return x + 338 + f49(x);
}

function f338(x: number): number {
  return x + 339 + f25(x) + f213(x) + f142(x) + clock.now();
}

function f339(x: number): number {
  return x + 340 + f290(x);
}

function f340(x: number): number {
  return x + 341 + f157(x) + f305(x) + clock.now();
}

function f341(x: number): number {
  return x + 342 + f271(x) + f293(x) + f180(x);
}

function f342(x: number): number {
  return x + 343 + f191(x);
}

function f343(x: number): number {
  return x + 344 + f106(x);
}

function f344(x: number): number {
  return x + 345 + f97(x) + f48(x) + f160(x);
}

function f345(x: number): number {
  return x + 346 + f60(x);
}

function f346(x: number): number {
  return x + 347 + f68(x) + f326(x) + f226(x);
}

function f347(x: number): number {
  return x + 348 + f87(x) + f54(x);
}

function f348(x: number): number {
  return x + 349 + f42(x);
}

function f349(x: number): number {
  return x + 350 + f221(x) + net.fetch("u349");
}

function f350(x: number): number {
  return x + 351 + f256(x) + f337(x) + clock.now();
}

function f351(x: number): number {
  return x + 352 + f44(x) + f267(x) + f299(x);
}

function f352(x: number): number {
  return x + 353 + f174(x);
}

function f353(x: number): number {
  return x + 354 + f131(x) + f61(x);
}

function f354(x: number): number {
  return x + 355 + f50(x) + f69(x) + f277(x);
}

function f355(x: number): number {
  return x + 356 + f34(x) + f26(x) + f119(x);
}

function f356(x: number): number {
  return x + 357 + f330(x) + f7(x);
}

function f357(x: number): number {
  return x + 358 + f198(x);
}

function f358(x: number): number {
  return x + 359 + f88(x) + f260(x) + f203(x);
}

function f359(x: number): number {
  return x + 360 + f158(x) + f57(x) + f20(x);
}

function f360(x: number): number {
  return x + 361 + f166(x);
}

function f361(x: number): number {
  return x + 362 + f260(x) + f103(x);
}

function f362(x: number): number {
  return x + 363 + f128(x) + f230(x) + f270(x) + store.get("k362");
}

function f363(x: number): number {
  return x + 364 + f171(x) + f238(x) + store.get("k363");
}

function f364(x: number): number {
  return x + 365 + f145(x);
}

function f365(x: number): number {
  return x + 366 + f282(x) + f195(x) + f148(x);
}

function f366(x: number): number {
  return x + 367 + f336(x) + f279(x);
}

function f367(x: number): number {
  return x + 368 + f234(x);
}

function f368(x: number): number {
  return x + 369 + f120(x);
}

function f369(x: number): number {
  return x + 370 + f116(x);
}

function f370(x: number): number {
  return x + 371 + f351(x) + f254(x);
}

function f371(x: number): number {
  return x + 372 + f329(x) + f222(x) + store.get("k371");
}

function f372(x: number): number {
  return x + 373 + f343(x) + f181(x);
}

function f373(x: number): number {
  return x + 374 + f31(x) + f134(x);
}

function f374(x: number): number {
  return x + 375 + f313(x) + f152(x);
}

function f375(x: number): number {
  return x + 376 + f193(x) + f127(x);
}

function f376(x: number): number {
  return x + 377 + f202(x) + f265(x) + f68(x) + store.get("k376");
}

function f377(x: number): number {
  return x + 378 + f186(x);
}

function f378(x: number): number {
  return x + 379 + f73(x) + f331(x) + f136(x);
}

function f379(x: number): number {
  return x + 380 + f162(x);
}

function f380(x: number): number {
  return x + 381 + f247(x) + f305(x);
}

function f381(x: number): number {
  return x + 382 + f333(x) + f1(x) + f178(x);
}

function f382(x: number): number {
  return x + 383 + f303(x);
}

function f383(x: number): number {
  return x + 384 + f26(x) + f188(x);
}

function f384(x: number): number {
  return x + 385 + f31(x) + f11(x) + f101(x) + store.get("k384");
}

function f385(x: number): number {
  return x + 386 + f167(x) + f95(x);
}

function f386(x: number): number {
  return x + 387 + f43(x) + f314(x) + f159(x);
}

function f387(x: number): number {
  return x + 388 + f189(x);
}

function f388(x: number): number {
  return x + 389 + f224(x);
}

function f389(x: number): number {
  return x + 390 + f299(x);
}

function f390(x: number): number {
  return x + 391 + f81(x);
}

function f391(x: number): number {
  return x + 392 + f280(x) + f124(x);
}

function f392(x: number): number {
  return x + 393 + f52(x) + f95(x) + f31(x);
}

function f393(x: number): number {
  return x + 394 + f72(x) + f27(x);
}

function f394(x: number): number {
  return x + 395 + f186(x) + f190(x) + f377(x);
}

function f395(x: number): number {
  return x + 396 + f115(x) + f37(x);
}

function f396(x: number): number {
  return x + 397 + f294(x) + f40(x) + f39(x);
}

function f397(x: number): number {
  return x + 398 + f107(x) + f393(x) + f257(x);
}

function f398(x: number): number {
  return x + 399 + f106(x) + f41(x) + f222(x);
}

function f399(x: number): number {
  return x + 400 + f145(x) + f128(x) + f312(x) + store.get("k399");
}

console.log(f399(Number(process.argv[2] ?? 1)));
