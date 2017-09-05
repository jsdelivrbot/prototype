//! { "noRuntime": true }

class SomeClass {
}

let a: SomeClass | null = null;

export function test(): SomeClass | null {
  return a;
}
