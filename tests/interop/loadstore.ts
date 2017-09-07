//! { "noRuntime": true }

export function doload(offset: usize): i32 {
  return load<int>(offset);
}

export function dostore(offset: usize, value: i32): void {
  store<int>(offset, value);
}
