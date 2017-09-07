//! { "noRuntime": true }

class B {
  c: i32;
}

class A {
  a: i32;
  b: B;
}

export function test(a: A): void {
  a.a;
  a.a = 1;
  a.b;
  a.b.c;
  a.b.c = 2;
}
