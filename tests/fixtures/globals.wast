 (export "getNaN" (func $getNaN))
 (export "getNaNAsNaNf" (func $getNaNAsNaNf))
 (export "getNaNf" (func $getNaNf))
 (export "getNaNfAsNaN" (func $getNaNfAsNaN))
 (export "getInfinity" (func $getInfinity))
 (export "getInfinityAsInfinityf" (func $getInfinityAsInfinityf))
 (export "getInfinityf" (func $getInfinityf))
 (export "getInfinityfAsInfinity" (func $getInfinityfAsInfinity))
 (export "memory" (memory $0))
 (func $getNaN (type $F) (result f64)
  (return
   (f64.const nan:0x8000000000000)
  )
 )
 (func $getNaNAsNaNf (type $f) (result f32)
  (return
   (f32.demote/f64
    (f64.const nan:0x8000000000000)
   )
  )
 )
 (func $getNaNf (type $f) (result f32)
  (return
   (f32.const nan:0x400000)
  )
 )
 (func $getNaNfAsNaN (type $F) (result f64)
  (return
   (f64.promote/f32
    (f32.const nan:0x400000)
   )
  )
 )
 (func $getInfinity (type $F) (result f64)
  (return
   (f64.const inf)
  )
 )
 (func $getInfinityAsInfinityf (type $f) (result f32)
  (return
   (f32.demote/f64
    (f64.const inf)
   )
  )
 )
 (func $getInfinityf (type $f) (result f32)
  (return
   (f32.const inf)
  )
 )
 (func $getInfinityfAsInfinity (type $F) (result f64)
  (return
   (f64.promote/f32
    (f32.const inf)
   )
  )
 )
