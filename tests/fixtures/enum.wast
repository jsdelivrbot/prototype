 (export "test" (func $test))
 (export "memory" (memory $0))
 (func $test (type $ii) (param $0 i32) (result i32)
  (if
   (i32.eq
    (get_local $0)
    (i32.const 0)
   )
   (return
    (i32.const 0)
   )
   (return
    (i32.const 1)
   )
  )
 )
