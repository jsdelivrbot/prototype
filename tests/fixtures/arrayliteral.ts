//! { "noRuntime": true }

export function test(): i32[] {
  return [1, 2, , 3];
}

export function testNested(): i32[][] {
  return [[1, 2, , 3], [4], []];
}
