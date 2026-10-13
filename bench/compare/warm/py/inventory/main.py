import sys, re

def num(s):
    return int(s) if re.fullmatch(r'[0-9]+', s) else None

def main():
    data = sys.argv[1] if len(sys.argv) > 1 else ""
    inv = {}
    rej = 0
    out = []
    for rec in data.split(";"):
        if rec == "":
            continue
        f = rec.split(":")
        c = f[0]
        ok = False
        if c == "add" and len(f) == 4:
            q, p = num(f[2]), num(f[3])
            if q is not None and p is not None:
                old = inv.get(f[1], [0, 0])
                inv[f[1]] = [old[0] + q, p]
                ok = True
        elif c == "remove" and len(f) == 3:
            q = num(f[2])
            if q is not None and f[1] in inv and inv[f[1]][0] >= q:
                inv[f[1]][0] -= q
                ok = True
        elif c == "price" and len(f) == 3:
            p = num(f[2])
            if p is not None and f[1] in inv:
                inv[f[1]][1] = p
                ok = True
        elif c == "report" and len(f) == 1:
            t = 0
            for k in sorted(inv):
                q, p = inv[k]
                out.append(f"{k} {q} {q*p}")
                t += q * p
            out.append(f"total {t}")
            ok = True
        if not ok:
            rej += 1
    out.append(f"rejected {rej}")
    print("\n".join(out))

main()
