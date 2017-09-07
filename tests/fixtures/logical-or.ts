//! { "noRuntime": true }

export function test(a: i32, b: f32, c: u64, d: bool): bool {
  if (a || b || c || d)
    return true;
  return false;
}
