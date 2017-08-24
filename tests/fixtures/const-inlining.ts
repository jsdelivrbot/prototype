//! { "noRuntime": true }

const a: int = 123;
const b: double = 3.1415;

export function test(): double {
  const c: double = 2.0;
  return a * b * c; // still includes a conversion
}
