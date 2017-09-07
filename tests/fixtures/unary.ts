//! { "noRuntime": true }

export function testInt(a: i32): void {
  let b: i32;
  let c: bool;

  // should be dropped
  !a;
  +a; // noop
  -a;
  ~a;

  // should be kept
  c = !a;
  b = +a;
  b = -a;
  b = ~a;

  // should become a set_local
  ++a;
  --a;
  a++;
  a--;

  // should become a tee_local
  b = ++a;
  b = --a;
  b = a++;
  b = a--;
}

export function testLong(a: i64): void {
  let b: i64;
  let c: bool;

  // should be dropped
  !a;
  +a; // noop
  -a;
  ~a;

  // should be kept
  c = !a;
  b = +a;
  b = -a;
  b = ~a;

  // should become a set_local
  ++a;
  --a;
  a++;
  a--;

  // should become a tee_local
  b = ++a;
  b = --a;
  b = a++;
  b = a--;
}

export function testFloat(a: f32): void {
  let b: f32;
  let c: bool;

  // should be dropped
  !a;
  +a; // noop
  -a;

  // should be kept
  c = !a;
  b = +a;
  b = -a;

  // should become a set_local
  ++a;
  --a;
  a++;
  a--;

  // should become a tee_local
  b = ++a;
  b = --a;
  b = a++;
  b = a--;
}

export function testDouble(a: f64): void {
  let b: f64;
  let c: bool;

  // should be dropped
  !a;
  +a; // noop
  -a;

  // should be kept
  c = !a;
  b = +a;
  b = -a;

  // should become a set_local
  ++a;
  --a;
  a++;
  a--;

  // should become a tee_local
  b = ++a;
  b = --a;
  b = a++;
  b = a--;
}
