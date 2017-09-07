//! { "noRuntime": true }

export function test(a: i32): i32 {
  let b: i32 = grow_memory(a);
  return current_memory();
}
