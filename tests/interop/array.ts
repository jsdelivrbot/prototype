let a: i32[] = [1, 2, 3];

export function getArray(): i32[] {
  return a;
}

export function getArrayCapacity(): i32 {
  return a.capacity;
}

export function getArrayLength(): i32 {
  return a.length;
}

export function getArrayElement(i: u32): i32 {
  return a[i];
}

export function getArrayElement0(): i32 {
  return a[0]; // simplified
}

export function getArrayElement2(): i32 {
  return a[2]; // optimized
}

export function setArray(b: i32[]): void {
  a = b;
}

export function setArrayElement(i: u32, value: i32): void {
  a[i] = value;
}

export function setArrayFrom(b: i32[]): void {
  for (let i: u32 = 0; i < b.length; ++i)
    a[i] = b[i];
}
