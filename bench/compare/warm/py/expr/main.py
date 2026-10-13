import sys
sys.setrecursionlimit(100000)

class Err(Exception):
    pass

def tokenize(s):
    t = []
    i = 0
    while i < len(s):
        c = s[i]
        if c == ' ':
            i += 1
        elif c in '0123456789':
            j = i
            while j < len(s) and s[j] in '0123456789':
                j += 1
            t.append(int(s[i:j]))
            i = j
        elif c in '+-*/()':
            t.append(c)
            i += 1
        else:
            raise Err
    return t

def evaluate(s):
    t = tokenize(s)
    pos = 0

    def peek():
        return t[pos] if pos < len(t) else None

    def expr():
        nonlocal pos
        v = term()
        while peek() in ('+', '-'):
            op = t[pos]; pos += 1
            r = term()
            v = v + r if op == '+' else v - r
        return v

    def term():
        nonlocal pos
        v = unary()
        while peek() in ('*', '/'):
            op = t[pos]; pos += 1
            r = unary()
            if op == '*':
                v *= r
            else:
                if r == 0:
                    raise Err
                q = abs(v) // abs(r)
                v = q if (v < 0) == (r < 0) else -q
        return v

    def unary():
        nonlocal pos
        k = peek()
        if k == '-':
            pos += 1
            return -unary()
        if k == '(':
            pos += 1
            v = expr()
            if peek() != ')':
                raise Err
            pos += 1
            return v
        if isinstance(k, int):
            pos += 1
            return k
        raise Err

    v = expr()
    if pos != len(t):
        raise Err
    return v

try:
    print(evaluate(sys.argv[1] if len(sys.argv) > 1 else ""))
except (Err, RecursionError):
    print("error")
