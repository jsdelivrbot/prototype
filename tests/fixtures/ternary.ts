//! { "noRuntime": true }

export function test(a: i32, b: i32): i32 {
  return a > b
    ? a == b
      ? 0
      : 1
    : -1 as u16;
}
