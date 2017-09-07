//! { "noRuntime": true }

const a: i32 = 123;

export function testGlobal(): i32 {
  return a;
}

const b: i32 = -123;

export function testGlobalNeg(): i32 {
  return b;
}

export function testLocal(): i32 {
  const c: i32 = 123;
  return c;
}

export function testLocalNeg(): i32 {
  const d: i32 = -123;
  return d;
}
