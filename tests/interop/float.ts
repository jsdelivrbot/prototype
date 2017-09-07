let a: f32[] = [0.125];
let b: f64[] = [1.25];

export function getFloatArray(): f32[] {
  return a;
}

export function getFloatValue(): f32 {
  return a[0];
}

export function setFloatValue(v: f32): void {
  a[0] = v;
}

export function getDoubleArray(): f64[] {
  return b;
}

export function getDoubleValue(): f64 {
  return b[0];
}

export function setDoubleValue(v: f64): void {
  b[0] = v;
}
