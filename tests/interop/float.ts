let a: float[] = [0.125];
let b: double[] = [1.25];

export function getFloatArray(): float[] {
  return a;
}

export function getFloatValue(): float {
  return a[0];
}

export function setFloatValue(v: float): void {
  a[0] = v;
}

export function getDoubleArray(): double[] {
  return b;
}

export function getDoubleValue(): double {
  return b[0];
}

export function setDoubleValue(v: double): void {
  b[0] = v;
}
