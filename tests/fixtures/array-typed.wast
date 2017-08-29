 (export "test" (func $test))
 (export "memory" (memory $0))
 (func $std:Array<sbyte> (type $iii) (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (nop)
  (if
   (i32.lt_s
    (get_local $1)
    (i32.const 0)
   )
   (unreachable)
  )
  (set_local $2
   (i32.mul
    (get_local $1)
    (i32.const 1)
   )
  )
  (set_local $3
   (call $lib:malloc
    (i32.add
     (i32.const 8)
     (get_local $2)
    )
   )
  )
  (set_local $4
   (get_local $3)
  )
  (i32.store
   (get_local $4)
   (get_local $1)
  )
  (i32.store offset=4
   (get_local $4)
   (get_local $1)
  )
  (drop
   (call $lib:memset
    (i32.add
     (get_local $3)
     (i32.const 8)
    )
    (i32.const 0)
    (get_local $2)
   )
  )
  (return
   (get_local $3)
  )
 )
 (func $std:Array<byte> (type $iii) (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (nop)
  (if
   (i32.lt_s
    (get_local $1)
    (i32.const 0)
   )
   (unreachable)
  )
  (set_local $2
   (i32.mul
    (get_local $1)
    (i32.const 1)
   )
  )
  (set_local $3
   (call $lib:malloc
    (i32.add
     (i32.const 8)
     (get_local $2)
    )
   )
  )
  (set_local $4
   (get_local $3)
  )
  (i32.store
   (get_local $4)
   (get_local $1)
  )
  (i32.store offset=4
   (get_local $4)
   (get_local $1)
  )
  (drop
   (call $lib:memset
    (i32.add
     (get_local $3)
     (i32.const 8)
    )
    (i32.const 0)
    (get_local $2)
   )
  )
  (return
   (get_local $3)
  )
 )
 (func $std:Array<short> (type $iii) (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (nop)
  (if
   (i32.lt_s
    (get_local $1)
    (i32.const 0)
   )
   (unreachable)
  )
  (set_local $2
   (i32.mul
    (get_local $1)
    (i32.const 2)
   )
  )
  (set_local $3
   (call $lib:malloc
    (i32.add
     (i32.const 8)
     (get_local $2)
    )
   )
  )
  (set_local $4
   (get_local $3)
  )
  (i32.store
   (get_local $4)
   (get_local $1)
  )
  (i32.store offset=4
   (get_local $4)
   (get_local $1)
  )
  (drop
   (call $lib:memset
    (i32.add
     (get_local $3)
     (i32.const 8)
    )
    (i32.const 0)
    (get_local $2)
   )
  )
  (return
   (get_local $3)
  )
 )
 (func $std:Array<ushort> (type $iii) (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (nop)
  (if
   (i32.lt_s
    (get_local $1)
    (i32.const 0)
   )
   (unreachable)
  )
  (set_local $2
   (i32.mul
    (get_local $1)
    (i32.const 2)
   )
  )
  (set_local $3
   (call $lib:malloc
    (i32.add
     (i32.const 8)
     (get_local $2)
    )
   )
  )
  (set_local $4
   (get_local $3)
  )
  (i32.store
   (get_local $4)
   (get_local $1)
  )
  (i32.store offset=4
   (get_local $4)
   (get_local $1)
  )
  (drop
   (call $lib:memset
    (i32.add
     (get_local $3)
     (i32.const 8)
    )
    (i32.const 0)
    (get_local $2)
   )
  )
  (return
   (get_local $3)
  )
 )
 (func $std:Array<int> (type $iii) (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (nop)
  (if
   (i32.lt_s
    (get_local $1)
    (i32.const 0)
   )
   (unreachable)
  )
  (set_local $2
   (i32.mul
    (get_local $1)
    (i32.const 4)
   )
  )
  (set_local $3
   (call $lib:malloc
    (i32.add
     (i32.const 8)
     (get_local $2)
    )
   )
  )
  (set_local $4
   (get_local $3)
  )
  (i32.store
   (get_local $4)
   (get_local $1)
  )
  (i32.store offset=4
   (get_local $4)
   (get_local $1)
  )
  (drop
   (call $lib:memset
    (i32.add
     (get_local $3)
     (i32.const 8)
    )
    (i32.const 0)
    (get_local $2)
   )
  )
  (return
   (get_local $3)
  )
 )
 (func $std:Array<uint> (type $iii) (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (nop)
  (if
   (i32.lt_s
    (get_local $1)
    (i32.const 0)
   )
   (unreachable)
  )
  (set_local $2
   (i32.mul
    (get_local $1)
    (i32.const 4)
   )
  )
  (set_local $3
   (call $lib:malloc
    (i32.add
     (i32.const 8)
     (get_local $2)
    )
   )
  )
  (set_local $4
   (get_local $3)
  )
  (i32.store
   (get_local $4)
   (get_local $1)
  )
  (i32.store offset=4
   (get_local $4)
   (get_local $1)
  )
  (drop
   (call $lib:memset
    (i32.add
     (get_local $3)
     (i32.const 8)
    )
    (i32.const 0)
    (get_local $2)
   )
  )
  (return
   (get_local $3)
  )
 )
 (func $std:Array<long> (type $iii) (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (nop)
  (if
   (i32.lt_s
    (get_local $1)
    (i32.const 0)
   )
   (unreachable)
  )
  (set_local $2
   (i32.mul
    (get_local $1)
    (i32.const 8)
   )
  )
  (set_local $3
   (call $lib:malloc
    (i32.add
     (i32.const 8)
     (get_local $2)
    )
   )
  )
  (set_local $4
   (get_local $3)
  )
  (i32.store
   (get_local $4)
   (get_local $1)
  )
  (i32.store offset=4
   (get_local $4)
   (get_local $1)
  )
  (drop
   (call $lib:memset
    (i32.add
     (get_local $3)
     (i32.const 8)
    )
    (i32.const 0)
    (get_local $2)
   )
  )
  (return
   (get_local $3)
  )
 )
 (func $std:Array<ulong> (type $iii) (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (nop)
  (if
   (i32.lt_s
    (get_local $1)
    (i32.const 0)
   )
   (unreachable)
  )
  (set_local $2
   (i32.mul
    (get_local $1)
    (i32.const 8)
   )
  )
  (set_local $3
   (call $lib:malloc
    (i32.add
     (i32.const 8)
     (get_local $2)
    )
   )
  )
  (set_local $4
   (get_local $3)
  )
  (i32.store
   (get_local $4)
   (get_local $1)
  )
  (i32.store offset=4
   (get_local $4)
   (get_local $1)
  )
  (drop
   (call $lib:memset
    (i32.add
     (get_local $3)
     (i32.const 8)
    )
    (i32.const 0)
    (get_local $2)
   )
  )
  (return
   (get_local $3)
  )
 )
 (func $std:Array<float> (type $iii) (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (nop)
  (if
   (i32.lt_s
    (get_local $1)
    (i32.const 0)
   )
   (unreachable)
  )
  (set_local $2
   (i32.mul
    (get_local $1)
    (i32.const 4)
   )
  )
  (set_local $3
   (call $lib:malloc
    (i32.add
     (i32.const 8)
     (get_local $2)
    )
   )
  )
  (set_local $4
   (get_local $3)
  )
  (i32.store
   (get_local $4)
   (get_local $1)
  )
  (i32.store offset=4
   (get_local $4)
   (get_local $1)
  )
  (drop
   (call $lib:memset
    (i32.add
     (get_local $3)
     (i32.const 8)
    )
    (i32.const 0)
    (get_local $2)
   )
  )
  (return
   (get_local $3)
  )
 )
 (func $std:Array<double> (type $iii) (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (nop)
  (if
   (i32.lt_s
    (get_local $1)
    (i32.const 0)
   )
   (unreachable)
  )
  (set_local $2
   (i32.mul
    (get_local $1)
    (i32.const 8)
   )
  )
  (set_local $3
   (call $lib:malloc
    (i32.add
     (i32.const 8)
     (get_local $2)
    )
   )
  )
  (set_local $4
   (get_local $3)
  )
  (i32.store
   (get_local $4)
   (get_local $1)
  )
  (i32.store offset=4
   (get_local $4)
   (get_local $1)
  )
  (drop
   (call $lib:memset
    (i32.add
     (get_local $3)
     (i32.const 8)
    )
    (i32.const 0)
    (get_local $2)
   )
  )
  (return
   (get_local $3)
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
   (call $std:Array<sbyte>
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
   (call $std:Array<byte>
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
   (call $std:Array<short>
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
   (call $std:Array<ushort>
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
   (call $std:Array<int>
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
   (call $std:Array<uint>
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
   (call $std:Array<long>
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
   (call $std:Array<ulong>
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
   (call $std:Array<float>
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
   (call $std:Array<double>
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
   (call $std:Array<sbyte>
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
