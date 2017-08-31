//! { "noRuntime": true }

export function testInt(a: int, b: int): void {
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

export function testUint(a: uint, b: uint): void {
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

export function testLong(a: long, b: long, c: int): void {
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

export function testUlong(a: ulong, b: ulong, c: int): void {
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

export function testFloat(a: float, b: float): void {
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

export function testDouble(a: double, b: double): void {
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
