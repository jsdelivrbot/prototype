//! { "noRuntime": true }

const a: int = 123;

export function testGlobal(): int {
  return a;
}

const b: int = -123;

export function testGlobalNeg(): int {
  return b;
}

export function testLocal(): int {
  const c: int = 123;
  return c;
}

export function testLocalNeg(): int {
  const d: int = -123;
  return d;
}
