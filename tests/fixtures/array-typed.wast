 (export "test" (func $test))
 (export "memory" (memory $0))
 (func $std:Array<i8> (type $iii) (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (if
   (i32.lt_s
    (get_local $1)
    (i32.const 0)
   )
   (unreachable)
  )
  (i32.store offset=4
   (get_local $0)
   (block (result i32)
    (set_local $2
     (get_local $0)
    )
    (i32.store
     (get_local $2)
     (get_local $1)
    )
    (i32.load
     (get_local $2)
    )
   )
  )
  (set_local $3
   (i32.mul
    (i32.load
     (get_local $0)
    )
    (i32.const 1)
   )
  )
  (i32.store offset=8
   (get_local $0)
   (call $lib:memset
    (call $lib:malloc
     (get_local $3)
    )
    (i32.const 0)
    (get_local $3)
   )
  )
  (return
   (get_local $0)
  )
 )
 (func $std:Array<u8> (type $iii) (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (if
   (i32.lt_s
    (get_local $1)
    (i32.const 0)
   )
   (unreachable)
  )
  (i32.store offset=4
   (get_local $0)
   (block (result i32)
    (set_local $2
     (get_local $0)
    )
    (i32.store
     (get_local $2)
     (get_local $1)
    )
    (i32.load
     (get_local $2)
    )
   )
  )
  (set_local $3
   (i32.mul
    (i32.load
     (get_local $0)
    )
    (i32.const 1)
   )
  )
  (i32.store offset=8
   (get_local $0)
   (call $lib:memset
    (call $lib:malloc
     (get_local $3)
    )
    (i32.const 0)
    (get_local $3)
   )
  )
  (return
   (get_local $0)
  )
 )
 (func $std:Array<i16> (type $iii) (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (if
   (i32.lt_s
    (get_local $1)
    (i32.const 0)
   )
   (unreachable)
  )
  (i32.store offset=4
   (get_local $0)
   (block (result i32)
    (set_local $2
     (get_local $0)
    )
    (i32.store
     (get_local $2)
     (get_local $1)
    )
    (i32.load
     (get_local $2)
    )
   )
  )
  (set_local $3
   (i32.mul
    (i32.load
     (get_local $0)
    )
    (i32.const 2)
   )
  )
  (i32.store offset=8
   (get_local $0)
   (call $lib:memset
    (call $lib:malloc
     (get_local $3)
    )
    (i32.const 0)
    (get_local $3)
   )
  )
  (return
   (get_local $0)
  )
 )
 (func $std:Array<u16> (type $iii) (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (if
   (i32.lt_s
    (get_local $1)
    (i32.const 0)
   )
   (unreachable)
  )
  (i32.store offset=4
   (get_local $0)
   (block (result i32)
    (set_local $2
     (get_local $0)
    )
    (i32.store
     (get_local $2)
     (get_local $1)
    )
    (i32.load
     (get_local $2)
    )
   )
  )
  (set_local $3
   (i32.mul
    (i32.load
     (get_local $0)
    )
    (i32.const 2)
   )
  )
  (i32.store offset=8
   (get_local $0)
   (call $lib:memset
    (call $lib:malloc
     (get_local $3)
    )
    (i32.const 0)
    (get_local $3)
   )
  )
  (return
   (get_local $0)
  )
 )
 (func $std:Array<i32> (type $iii) (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (if
   (i32.lt_s
    (get_local $1)
    (i32.const 0)
   )
   (unreachable)
  )
  (i32.store offset=4
   (get_local $0)
   (block (result i32)
    (set_local $2
     (get_local $0)
    )
    (i32.store
     (get_local $2)
     (get_local $1)
    )
    (i32.load
     (get_local $2)
    )
   )
  )
  (set_local $3
   (i32.mul
    (i32.load
     (get_local $0)
    )
    (i32.const 4)
   )
  )
  (i32.store offset=8
   (get_local $0)
   (call $lib:memset
    (call $lib:malloc
     (get_local $3)
    )
    (i32.const 0)
    (get_local $3)
   )
  )
  (return
   (get_local $0)
  )
 )
 (func $std:Array<u32> (type $iii) (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (if
   (i32.lt_s
    (get_local $1)
    (i32.const 0)
   )
   (unreachable)
  )
  (i32.store offset=4
   (get_local $0)
   (block (result i32)
    (set_local $2
     (get_local $0)
    )
    (i32.store
     (get_local $2)
     (get_local $1)
    )
    (i32.load
     (get_local $2)
    )
   )
  )
  (set_local $3
   (i32.mul
    (i32.load
     (get_local $0)
    )
    (i32.const 4)
   )
  )
  (i32.store offset=8
   (get_local $0)
   (call $lib:memset
    (call $lib:malloc
     (get_local $3)
    )
    (i32.const 0)
    (get_local $3)
   )
  )
  (return
   (get_local $0)
  )
 )
 (func $std:Array<i64> (type $iii) (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (if
   (i32.lt_s
    (get_local $1)
    (i32.const 0)
   )
   (unreachable)
  )
  (i32.store offset=4
   (get_local $0)
   (block (result i32)
    (set_local $2
     (get_local $0)
    )
    (i32.store
     (get_local $2)
     (get_local $1)
    )
    (i32.load
     (get_local $2)
    )
   )
  )
  (set_local $3
   (i32.mul
    (i32.load
     (get_local $0)
    )
    (i32.const 8)
   )
  )
  (i32.store offset=8
   (get_local $0)
   (call $lib:memset
    (call $lib:malloc
     (get_local $3)
    )
    (i32.const 0)
    (get_local $3)
   )
  )
  (return
   (get_local $0)
  )
 )
 (func $std:Array<u64> (type $iii) (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (if
   (i32.lt_s
    (get_local $1)
    (i32.const 0)
   )
   (unreachable)
  )
  (i32.store offset=4
   (get_local $0)
   (block (result i32)
    (set_local $2
     (get_local $0)
    )
    (i32.store
     (get_local $2)
     (get_local $1)
    )
    (i32.load
     (get_local $2)
    )
   )
  )
  (set_local $3
   (i32.mul
    (i32.load
     (get_local $0)
    )
    (i32.const 8)
   )
  )
  (i32.store offset=8
   (get_local $0)
   (call $lib:memset
    (call $lib:malloc
     (get_local $3)
    )
    (i32.const 0)
    (get_local $3)
   )
  )
  (return
   (get_local $0)
  )
 )
 (func $std:Array<f32> (type $iii) (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (if
   (i32.lt_s
    (get_local $1)
    (i32.const 0)
   )
   (unreachable)
  )
  (i32.store offset=4
   (get_local $0)
   (block (result i32)
    (set_local $2
     (get_local $0)
    )
    (i32.store
     (get_local $2)
     (get_local $1)
    )
    (i32.load
     (get_local $2)
    )
   )
  )
  (set_local $3
   (i32.mul
    (i32.load
     (get_local $0)
    )
    (i32.const 4)
   )
  )
  (i32.store offset=8
   (get_local $0)
   (call $lib:memset
    (call $lib:malloc
     (get_local $3)
    )
    (i32.const 0)
    (get_local $3)
   )
  )
  (return
   (get_local $0)
  )
 )
 (func $std:Array<f64> (type $iii) (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (if
   (i32.lt_s
    (get_local $1)
    (i32.const 0)
   )
   (unreachable)
  )
  (i32.store offset=4
   (get_local $0)
   (block (result i32)
    (set_local $2
     (get_local $0)
    )
    (i32.store
     (get_local $2)
     (get_local $1)
    )
    (i32.load
     (get_local $2)
    )
   )
  )
  (set_local $3
   (i32.mul
    (i32.load
     (get_local $0)
    )
    (i32.const 8)
   )
  )
  (i32.store offset=8
   (get_local $0)
   (call $lib:memset
    (call $lib:malloc
     (get_local $3)
    )
    (i32.const 0)
    (get_local $3)
   )
  )
  (return
   (get_local $0)
  )
 )
 (func $test (type $v)
  (local $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (set_local $0
   (call $std:Array<i8>
    (call $lib:memset
     (call $lib:malloc
      (i32.const 8)
     )
     (i32.const 0)
     (i32.const 8)
    )
    (i32.const 1)
   )
  )
  (set_local $1
   (call $std:Array<u8>
    (call $lib:memset
     (call $lib:malloc
      (i32.const 8)
     )
     (i32.const 0)
     (i32.const 8)
    )
    (i32.const 2)
   )
  )
  (set_local $2
   (call $std:Array<i16>
    (call $lib:memset
     (call $lib:malloc
      (i32.const 8)
     )
     (i32.const 0)
     (i32.const 8)
    )
    (i32.const 3)
   )
  )
  (set_local $3
   (call $std:Array<u16>
    (call $lib:memset
     (call $lib:malloc
      (i32.const 8)
     )
     (i32.const 0)
     (i32.const 8)
    )
    (i32.const 4)
   )
  )
  (set_local $4
   (call $std:Array<i32>
    (call $lib:memset
     (call $lib:malloc
      (i32.const 8)
     )
     (i32.const 0)
     (i32.const 8)
    )
    (i32.const 5)
   )
  )
  (set_local $5
   (call $std:Array<u32>
    (call $lib:memset
     (call $lib:malloc
      (i32.const 8)
     )
     (i32.const 0)
     (i32.const 8)
    )
    (i32.const 6)
   )
  )
  (set_local $6
   (call $std:Array<i64>
    (call $lib:memset
     (call $lib:malloc
      (i32.const 8)
     )
     (i32.const 0)
     (i32.const 8)
    )
    (i32.const 7)
   )
  )
  (set_local $7
   (call $std:Array<u64>
    (call $lib:memset
     (call $lib:malloc
      (i32.const 8)
     )
     (i32.const 0)
     (i32.const 8)
    )
    (i32.const 8)
   )
  )
  (set_local $8
   (call $std:Array<f32>
    (call $lib:memset
     (call $lib:malloc
      (i32.const 8)
     )
     (i32.const 0)
     (i32.const 8)
    )
    (i32.const 9)
   )
  )
  (set_local $9
   (call $std:Array<f64>
    (call $lib:memset
     (call $lib:malloc
      (i32.const 8)
     )
     (i32.const 0)
     (i32.const 8)
    )
    (i32.const 10)
   )
  )
  (set_local $10
   (call $std:Array<i8>
    (call $lib:memset
     (call $lib:malloc
      (i32.const 8)
     )
     (i32.const 0)
     (i32.const 8)
    )
    (i32.const 11)
   )
  )
 )
