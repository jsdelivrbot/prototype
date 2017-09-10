//! { "noRuntime": true }

let int_c: i32;

export function testInt(a: i32): void {
  let b: i32;
  let r: bool;

  // should be dropped
  !a;
  +a; // noop
  -a;
  ~a;

  // should be kept
  r = !a;
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

  // should become a set_global
  ++int_c;
  --int_c;
  int_c++;
  int_c--;
}

let long_c: i64;

export function testLong(a: i64): void {
  let b: i64;
  let r: bool;

  // should be dropped
  !a;
  +a; // noop
  -a;
  ~a;

  // should be kept
  r = !a;
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

  // should become a set_global
  ++long_c;
  --long_c;
  long_c++;
  long_c--;
}

let float_c: f32;

export function testFloat(a: f32): void {
  let b: f32;
  let r: bool;

  // should be dropped
  !a;
  +a; // noop
  -a;

  // should be kept
  r = !a;
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

  // should become a set_global
  ++float_c;
  --float_c;
  float_c++;
  float_c--;
}

let double_c: f64;

export function testDouble(a: f64): void {
  let b: f64;
  let r: bool;

  // should be dropped
  !a;
  +a; // noop
  -a;

  // should be kept
  r = !a;
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

  // should become a set_global
  ++double_c;
  --double_c;
  double_c++;
  double_c--;
}
