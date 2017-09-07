//! { "noRuntime": true }

class A {
  static a: i32;
}

export function test(): void {
  A.a;
  A.a = 1;
}
