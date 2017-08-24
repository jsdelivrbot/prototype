 (export "test" (func $test))
 (export "memory" (memory $0))
 (func $test (type $F) (result f64)
  (nop)
  (return
   (f64.mul
    (f64.mul
     (f64.convert_s/i32
      (i32.const 123)
     )
     (f64.const 3.1415)
    )
    (f64.const 2)
   )
  )
 )
