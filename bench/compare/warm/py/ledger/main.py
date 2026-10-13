import sys, re

def amt(s):
    if re.fullmatch(r'[0-9]+', s) and int(s) > 0:
        return int(s)
    return None

def main():
    data = sys.argv[1] if len(sys.argv) > 1 else ""
    acc = {}
    rej = 0
    for rec in data.split(";"):
        if rec == "":
            continue
        f = rec.split(":")
        ok = False
        c = f[0]
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
    out = [f"{k} {v}" for k, v in acc.items()]
    out.append(f"rejected {rej}")
    print("\n".join(out))

main()
