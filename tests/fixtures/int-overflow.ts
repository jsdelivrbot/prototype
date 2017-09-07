//! { "noRuntime": true }

export function testSbyte(): i8 {
  return -1 + 1;
}

export function testByte(): u8 {
  return 255 + 1;
}

export function testShort(): i16 {
  return -1 + 1;
}

export function testUshort(): u16 {
  return 65535 + 1;
}

export function testInt(): i32 {
  return -1 + 1;
}

export function testUint(): u32 {
  return 4294967295 + 1;
}

export function testLong(): i64 {
  return -1 + 1;
}

export function testUlong(): u64 {
  return 18446744073709551615 + 1;
}
