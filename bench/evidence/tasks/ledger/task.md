Process a bank ledger given as one string of records separated by ";" (an empty record is skipped). Each record is one of:
- deposit:NAME:AMOUNT  creates the account if it does not exist and adds AMOUNT
- withdraw:NAME:AMOUNT  subtracts AMOUNT if the account exists and has at least AMOUNT; otherwise the record is rejected
- transfer:FROM:TO:AMOUNT  moves AMOUNT from FROM to TO (creating TO if needed) if FROM exists, has at least AMOUNT, and FROM is not TO; otherwise rejected
AMOUNT must be a positive integer written in digits; a record with any other amount, a wrong number of fields, or an unknown command is rejected and changes nothing.
Print one line per account, "NAME BALANCE", in the order accounts were first created, then one line "rejected N" with the number of rejected records.
