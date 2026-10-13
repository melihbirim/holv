import sys

def amt(s):
    if s and s.isascii() and s.isdigit() and int(s) > 0:
        return int(s)
    return None

def main():
    data = sys.argv[1] if len(sys.argv) > 1 else ""
    acc = {}
    rej = 0
    for r in data.split(";"):
        if r == "":
            continue
        f = r.split(":")
        c = f[0]
        ok = False
        if c == "deposit" and len(f) == 3:
            a = amt(f[2])
            if a is not None:
                acc[f[1]] = acc.get(f[1], 0) + a
                ok = True
        elif c == "withdraw" and len(f) == 3:
            a = amt(f[2])
            if a is not None and f[1] in acc and acc[f[1]] >= a:
                acc[f[1]] -= a
                ok = True
        elif c == "transfer" and len(f) == 4:
            a = amt(f[3])
            if a is not None and f[1] != f[2] and f[1] in acc and acc[f[1]] >= a:
                acc[f[1]] -= a
                acc[f[2]] = acc.get(f[2], 0) + a
                ok = True
        if not ok:
            rej += 1
    for k, v in acc.items():
        print(k, v)
    print("rejected", rej)

main()
