//! { "noRuntime": true }

/* class A {
  a: i32 = 1;
  b: i32 = this.a + 2;

  // doesn't work, yet
} */

class B {
  a: i32 = 1;
  b: i32 = this.a + 2;

  constructor(
    public c: i32
  ) {
  }
}

export function test(): void {
  // let a: A = new A();
  let b: B = new B(3);
}
