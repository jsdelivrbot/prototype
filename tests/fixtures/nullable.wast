 (export "test" (func $test))
 (export "memory" (memory $0))
 (start $.start)
 (func $test (type $i) (result i32)
  (return
   (get_global $a)
  )
 )
 (func $.start (type $v)
  (set_global $a
   (i32.const 0)
  )
 )
