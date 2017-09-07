//! { "noRuntime": true }

export function testIntToFloat(a: i32): f32 {
  return reinterpretf(a);
}

export function testLongToDouble(a: i64): f64 {
  return reinterpretd(a);
}

export function testFloatToInt(a: f32): i32 {
  return reinterpreti(a);
}

export function testDoubleToLong(a: f64): i64 {
  return reinterpretl(a);
}
