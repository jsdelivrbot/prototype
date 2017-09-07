//! { "noRuntime": true }

export function test(num: i32): i32 {
  if (num <= 1) return 1;
  return test(num - 1) + test(num - 2);
}
