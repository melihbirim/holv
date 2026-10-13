import re
import sys

AMT = re.compile(r'[0-9]+')


def parse_amount(s):
    if not AMT.fullmatch(s):
        return None
    v = int(s)
    return v if v > 0 else None


def main():
    data = sys.argv[1] if len(sys.argv) > 1 else ""
    bal = {}
    order = []
    rejected = 0
    for rec in data.split(";"):
        if rec == "":
            continue
        f = rec.split(":")
        cmd = f[0]
        ok = False
        if cmd == "deposit" and len(f) == 3:
            a = parse_amount(f[2])
            if a is not None:
                n = f[1]
                if n not in bal:
                    bal[n] = 0
                    order.append(n)
                bal[n] += a
                ok = True
        elif cmd == "withdraw" and len(f) == 3:
            a = parse_amount(f[2])
            n = f[1]
            if a is not None and n in bal and bal[n] >= a:
                bal[n] -= a
                ok = True
        elif cmd == "transfer" and len(f) == 4:
            a = parse_amount(f[3])
            fr, to = f[1], f[2]
            if a is not None and fr in bal and fr != to and bal[fr] >= a:
                bal[fr] -= a
                if to not in bal:
                    bal[to] = 0
                    order.append(to)
                bal[to] += a
                ok = True
        if not ok:
            rejected += 1
    out = [f"{n} {bal[n]}" for n in order]
    out.append(f"rejected {rejected}")
    sys.stdout.write("\n".join(out) + "\n")


if __name__ == "__main__":
    main()
