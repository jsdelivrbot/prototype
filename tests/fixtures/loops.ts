//! { "noRuntime": true }

export function testDo(n: i32): i32 {
  let i: i32 = 0;
  do {
    i = i + 1;
  } while (i < n);
  return i;
}

export function testWhile(n: i32): i32 {
  let i: i32 = 0;
  while (i < n) {
    i = i + 1;
  }
  return i;
}

export function testWhileEmpty(): void {
  while (false);
  while (true);
}

export function testFor(n: i32): i32 {
  for (let i: i32 = 0; i < n; ++i) { }

  let j: i32 = 0;
  for (; j < n; ++j) {}

  for (j = 0; j < n; ++j) {}

  for (j = 0; j < n;) {
    j++;
  }

  for (;;) break;

  return j;
}
