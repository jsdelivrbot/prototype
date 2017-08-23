//! { "noRuntime": true }

export function getNaN(): double {
  return NaN;
}

export function getNaNAsNaNf(): float {
  return NaN as float;
}

export function getNaNf(): float {
  return NaNf;
}

export function getNaNfAsNaN(): double {
  return NaNf;
}

export function getInfinity(): double {
  return Infinity;
}

export function getInfinityAsInfinityf(): float {
  return Infinity as float;
}

export function getInfinityf(): float {
  return Infinityf;
}

export function getInfinityfAsInfinity(): double {
  return Infinityf;
}
