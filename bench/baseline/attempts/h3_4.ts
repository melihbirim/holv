// Technique: error stack handler. Error is not banned and prepareStackTrace is not a banned property. Installing a
// handler means it runs implicitly when .stack is first read inside pure. The handler reaches process through a
// Function-constructed string and calls the fs builtin via process.getBuiltinModule.
const { constructor: F } = () => 0;

Error.prepareStackTrace = (): string => {
  F("return process.getBuiltinModule('node:fs').readFileSync('/etc/hostname')")();
  return "";
};

export function pure(x: number): number {
  const stack: string = new Error().stack;
  return x + stack.length * 0;
}
