//! { "noRuntime": true }

export function testInt(a: i32, b: i32): void {
  a + b;
  a - b;
  a * b;
  a / b;
  a == b;
  a != b;
  a > b;
  a >= b;
  a < b;
  a <= b;

  // int only
  a % b;
  a & b;
  a | b;
  a ^ b;
  a << b;
  a >> b;
  a >>> b;
}

export function testUint(a: u32, b: u32): void {
  a / b;
  a > b;
  a >= b;
  a < b;
  a <= b;

  // int only
  a % b;
  a >> b;
  a >>> b;
}

export function testLong(a: i64, b: i64, c: i32): void {
  a + b;
  a - b;
  a * b;
  a / b;
  a == b;
  a != b;
  a > b;
  a >= b;
  a < b;
  a <= b;

  // int only
  a % b;
  a & b;
  a | b;
  a ^ b;
  a << b;
  a >> b;
  a >>> b;

  // long only (usually)
  a << c;
  a >> c;
  a >>> c;
}

export function testUlong(a: u64, b: u64, c: i32): void {
  a / b;
  a > b;
  a >= b;
  a < b;
  a <= b;

  // int only
  a % b;
  a >> (b as long);
  a >>> (b as long);

  // long only (usually)
  a << c;
  a >> c;
  a >>> c;
}

export function testFloat(a: f32, b: f32): void {
  a + b;
  a - b;
  a * b;
  a / b;
  a == b;
  a != b;
  a > b;
  a >= b;
  a < b;
  a <= b;

  // todo: emulate?
  // a % b;
}

export function testDouble(a: f64, b: f64): void {
  a + b;
  a - b;
  a * b;
  a / b;
  a == b;
  a != b;
  a > b;
  a >= b;
  a < b;
  a <= b;

  // todo: emulate?
  // a % b;
}
