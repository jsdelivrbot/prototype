 (export "test" (func $test))
 (export "memory" (memory $0))
 (func $B (type $iii) (param $0 i32) (param $1 i32) (result i32)
  (i32.store
   (get_local $0)
   (i32.const 1)
  )
  (i32.store offset=4
   (get_local $0)
   (i32.add
    (i32.load
     (get_local $0)
    )
    (i32.const 2)
   )
  )
  (i32.store offset=8
   (get_local $0)
   (get_local $1)
  )
  (return
   (get_local $0)
  )
 )
 (func $test (type $v)
  (local $0 i32)
  (set_local $0
   (call $B
    (call $lib:memset
     (call $lib:malloc
      (i32.const 12)
     )
     (i32.const 0)
     (i32.const 12)
    )
    (i32.const 3)
   )
  )
 )
