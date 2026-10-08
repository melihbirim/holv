Maintain an inventory from a string of commands separated by ";" (empty commands are skipped):
- add:SKU:QTY:PRICE  adds QTY units of SKU and sets its unit price to PRICE (creating the SKU if new)
- remove:SKU:QTY  removes QTY units if SKU exists and has at least QTY; otherwise rejected
- price:SKU:PRICE  sets the unit price if SKU exists; otherwise rejected
- report  prints one line per SKU in ascending SKU order, "SKU QTY VALUE" where VALUE is QTY times the unit price, followed by "total T" with the sum of all VALUEs
QTY and PRICE are non-negative integers written in digits; a command with any other number, a wrong number of fields, or an unknown command is rejected and changes nothing. Values must be exact.
After all commands, print "rejected N".
