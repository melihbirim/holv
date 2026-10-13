#!/usr/bin/env python3
# Round 3 reference: the mathematically exact output of each attempt, in Python integers. Float operations are IEEE doubles
# as in the spec. Usage: reference-int.py <attempt> [arg...]; prints JSON {"out": [...], "stop": bool}. "stop" means an Int
# left +-(2**53-1) (or an input was not an Int) at that point, so a correct holv program prints the lines in "out" and stops.
import json, math, sys
MAX = 2**53 - 1
class Stop(Exception): pass
def ck(n):
    if abs(n) > MAX: raise Stop()
    return n
def tdiv(a, b):
    q = abs(a) // abs(b)
    return q if (a < 0) == (b < 0) else -q
def tmod(a, b): return a - tdiv(a, b) * b
def js(f):  # JS String(number)
    if f != f: return "NaN"
    if f in (math.inf, -math.inf): return "Infinity" if f > 0 else "-Infinity"
    return str(int(f)) if f == int(f) and abs(f) < 1e21 else repr(f)
def parse_int(s):
    try: return ck(int(s.strip()))
    except ValueError: raise Stop()
def parse_float(s):
    try: return float(s)
    except ValueError: raise Stop()
def a1(args, out):
    n = parse_int(args[0]); out.append(str(n)); out.append(str(ck(n - 1)))
def a2(args, out):
    rounds = parse_int(args[0]); x = 12345; acc = neg = bad = 0
    for _ in range(rounds):
        x = tmod(ck(x * 48271), 2147483647); y = tmod(ck(x * 40503), 4194301)
        l = ck(ck(x * 4194301) + y); r = tmod(y, 67108864) + 1
        acc = tmod(ck(ck(acc * 31) + tdiv(l, r)) + tmod(l, r), 1000000007)
        neg = tmod(ck(ck(neg * 31) + tdiv(-l, r)) + tmod(-l, r), 1000000007)
        if ck(tdiv(l, r) * r) + tmod(l, r) != l: bad += 1
    out += [str(acc), str(neg), str(bad)]
def a3(args, out):
    n = parse_int(args[0]); z = tmod(-n, n); out.append(str(z)); out.append(js(float(z)))
    out.append(js(1.0 / float(z) if z else math.inf))  # IEEE: 1.0 / +0.0
def a4(args, out):
    x = parse_float(args[0])
    def fl(f):
        if f != f or f in (math.inf, -math.inf): raise Stop()
        return ck(math.floor(f))
    out.append(str(fl(x)))
    out.append(str(fl(math.sqrt(x) if x >= 0 else math.nan)))
    out.append(str(fl(x * 1.5)))
def a5(args, out): raise Stop()  # every method returns a number outside Int
def c1(args, out): raise Stop()
name, args = sys.argv[1], sys.argv[2:]
out, stop = [], False
try: globals()[name](args, out)
except Stop: stop = True
print(json.dumps({"out": out, "stop": stop}))
