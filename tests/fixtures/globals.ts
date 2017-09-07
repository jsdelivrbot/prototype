//! { "noRuntime": true }

export function getNaN(): f64 {
  return NaN;
}

export function getNaNAsNaNf(): f32 {
  return NaN as f32;
}

export function getNaNf(): f32 {
  return NaNf;
}

export function getNaNfAsNaN(): f64 {
  return NaNf;
}

export function getInfinity(): f64 {
  return Infinity;
}

export function getInfinityAsInfinityf(): f32 {
  return Infinity as f32;
}

export function getInfinityf(): f32 {
  return Infinityf;
}

export function getInfinityfAsInfinity(): f64 {
  return Infinityf;
}
