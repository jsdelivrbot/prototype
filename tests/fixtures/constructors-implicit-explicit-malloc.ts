//! { "noRuntime": true }

class TestImplicit {
  constructor() {
  }
}

@no_implicit_malloc()
class TestExplicit {
  readonly prop: u8; // let's pretend...
  constructor() {
    let ptr: usize = malloc(1);
    return unsafe_cast<usize,this>(ptr);
  }
}

export function test(): void {
  let implicit: TestImplicit = new TestImplicit();
  let explicit: TestExplicit = new TestExplicit();
}
