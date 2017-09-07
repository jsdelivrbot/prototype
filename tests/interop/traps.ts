export function i32_trunc_s_f32(): i32 {
  const a: f32 = 4294967296.0;
  return a as i32; // traps
}

export function i32_trunc_u_f32(): u32 {
  const a: f32 = 4294967296.0;
  return a as uint; // traps
}

export function stmt_unreachable(): void {
  unreachable();
}

export function div_by_zero(): i32 {
  const a: i32 = 123;
  return a / 0;
}

export function rem_by_zero(): i32 {
  const a: i32 = 123;
  return a % 0;
}

export function div_overflow(): i32 {
  const a: i32 = -2147483648;
  return a / -1;
}

export function oob_access(): i32 {
  const a: i32[] = new Array(0);
  return a[16384];
}
