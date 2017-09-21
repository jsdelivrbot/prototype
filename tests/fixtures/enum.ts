//! { "noRuntime": true }

enum Values {
  ZERO,
  NONZERO
}

export function test(n: i32): Values {
  if (n == 0)
    return Values.ZERO;
  else
    return Values.NONZERO;
}
