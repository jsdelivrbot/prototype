 (export "test" (func $test))
 (export "memory" (memory $0))
 (func $SomeClass<i32>#instanceMethod<f32> (type $iff) (param $0 i32) (param $1 f32) (result f32)
  (return
   (get_local $1)
  )
 )
 (func $SomeClass<i64>#instanceMethod<f64> (type $iFF) (param $0 i32) (param $1 f64) (result f64)
  (return
   (get_local $1)
  )
 )
 (func $SomeClass.staticMethod<f32> (type $ff) (param $0 f32) (result f32)
  (return
   (get_local $0)
  )
 )
 (func $SomeClass.staticMethod<f64> (type $FF) (param $0 f64) (result f64)
  (return
   (get_local $0)
  )
 )
 (func $test (type $iiv) (param $0 i32) (param $1 i32)
  (drop
   (call $SomeClass<i32>#instanceMethod<f32>
    (get_local $0)
    (f32.const 0.25)
   )
  )
  (drop
   (call $SomeClass<i64>#instanceMethod<f64>
    (get_local $1)
    (f64.const 0.5)
   )
  )
  (drop
   (call $SomeClass.staticMethod<f32>
    (f32.const 0.75)
   )
  )
  (drop
   (call $SomeClass.staticMethod<f64>
    (f64.const 1)
   )
  )
 )
