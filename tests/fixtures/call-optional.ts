//! { "noRuntime": true }

function fn(a: i32 = 1, b: i32 = 2): void {
}

export function test(): void {
  fn();
  fn(3);
  fn(3, 4);
}
