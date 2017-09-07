//! { "noRuntime": true }

class SomeClass<T> {
  instanceMethod<V>(a: V): V {
    return a;
  };
  static staticMethod<V>(a: V): V {
    return a;
  };
}

export function test(a: SomeClass<i32>, b: SomeClass<i64>): void {
  a.instanceMethod<f32>(0.25);
  b.instanceMethod<f64>(0.5);
  SomeClass.staticMethod<f32>(0.75);
  SomeClass.staticMethod<f64>(1.0);
}
