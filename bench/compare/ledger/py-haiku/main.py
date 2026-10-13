import re
import sys

_AMOUNT_RE = re.compile(r"[0-9]+")


def _parse_amount(text):
    """Return the positive integer amount, or None if it is not a valid amount."""
    if not _AMOUNT_RE.fullmatch(text):
        return None
    value = int(text)
    return value if value > 0 else None


def process(ledger):
    """Apply the ledger string and return the output lines."""
    balances = {}
    order = []
    rejected = 0

    for record in ledger.split(";"):
        if record == "":
            continue
        parts = record.split(":")
        command = parts[0]
        ok = False

        if command == "deposit" and len(parts) == 3:
            name = parts[1]
            amount = _parse_amount(parts[2])
            if amount is not None:
                if name not in balances:
                    balances[name] = 0
                    order.append(name)
                balances[name] += amount
                ok = True

        elif command == "withdraw" and len(parts) == 3:
            name = parts[1]
            amount = _parse_amount(parts[2])
            if amount is not None and name in balances and balances[name] >= amount:
                balances[name] -= amount
                ok = True

        elif command == "transfer" and len(parts) == 4:
            source, target = parts[1], parts[2]
            amount = _parse_amount(parts[3])
            if (
                amount is not None
                and source != target
                and source in balances
                and balances[source] >= amount
            ):
                balances[source] -= amount
                if target not in balances:
                    balances[target] = 0
                    order.append(target)
                balances[target] += amount
                ok = True

        if not ok:
            rejected += 1

    lines = [f"{name} {balances[name]}" for name in order]
    lines.append(f"rejected {rejected}")
    return lines


def main():
    ledger = sys.argv[1] if len(sys.argv) > 1 else ""
    for line in process(ledger):
        print(line)


if __name__ == "__main__":
    main()
