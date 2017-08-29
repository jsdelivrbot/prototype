(module
 (type $iF (func (param i32) (result f64)))
 (type $ii (func (param i32) (result i32)))
 (type $iiii (func (param i32 i32 i32) (result i32)))
 (type $iii (func (param i32 i32) (result i32)))
 (type $i (func (result i32)))
 (type $iFFFFFFFi (func (param i32 f64 f64 f64 f64 f64 f64 f64) (result i32)))
 (type $iFFFi (func (param i32 f64 f64 f64) (result i32)))
 (type $iFv (func (param i32 f64)))
 (type $v (func))
 (import "lib" "malloc" (func $lib:malloc (param i32) (result i32)))
 (import "lib" "memset" (func $lib:memset (param i32 i32 i32) (result i32)))
 (global $SOLAR_MASS (mut f64) (f64.const 0))
 (memory $0 1)
 (export "test" (func $test))
 (export "memory" (memory $0))
 (start $.start)
 (func $std:Array<Body> (type $iii) (param $0 i32) (param $1 i32) (result i32)
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
    (i32.const 56)
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
 (func $Body (type $iFFFFFFFi) (param $0 i32) (param $1 f64) (param $2 f64) (param $3 f64) (param $4 f64) (param $5 f64) (param $6 f64) (param $7 f64) (result i32)
  (f64.store
   (get_local $0)
   (get_local $1)
  )
  (f64.store offset=8
   (get_local $0)
   (get_local $2)
  )
  (f64.store offset=16
   (get_local $0)
   (get_local $3)
  )
  (f64.store offset=24
   (get_local $0)
   (get_local $4)
  )
  (f64.store offset=32
   (get_local $0)
   (get_local $5)
  )
  (f64.store offset=40
   (get_local $0)
   (get_local $6)
  )
  (f64.store offset=48
   (get_local $0)
   (get_local $7)
  )
  (return
   (get_local $0)
  )
 )
 (func $Sun (type $i) (result i32)
  (return
   (call $Body
    (call $lib:memset
     (call $lib:malloc
      (i32.const 56)
     )
     (i32.const 0)
     (i32.const 56)
    )
    (f64.const 0)
    (f64.const 0)
    (f64.const 0)
    (f64.const 0)
    (f64.const 0)
    (f64.const 0)
    (get_global $SOLAR_MASS)
   )
  )
 )
 (func $Jupiter (type $i) (result i32)
  (return
   (call $Body
    (call $lib:memset
     (call $lib:malloc
      (i32.const 56)
     )
     (i32.const 0)
     (i32.const 56)
    )
    (f64.const 4.841431442464721)
    (f64.const -1.1603200440274284)
    (f64.const -0.10362204447112311)
    (f64.mul
     (f64.const 0.001660076642744037)
     (f64.const 365.24)
    )
    (f64.mul
     (f64.const 0.007699011184197404)
     (f64.const 365.24)
    )
    (f64.mul
     (f64.const -6.90460016972063e-05)
     (f64.const 365.24)
    )
    (f64.mul
     (f64.const 9.547919384243266e-04)
     (get_global $SOLAR_MASS)
    )
   )
  )
 )
 (func $Saturn (type $i) (result i32)
  (return
   (call $Body
    (call $lib:memset
     (call $lib:malloc
      (i32.const 56)
     )
     (i32.const 0)
     (i32.const 56)
    )
    (f64.const 8.34336671824458)
    (f64.const 4.124798564124305)
    (f64.const -0.4035234171143214)
    (f64.mul
     (f64.const -0.002767425107268624)
     (f64.const 365.24)
    )
    (f64.mul
     (f64.const 0.004998528012349172)
     (f64.const 365.24)
    )
    (f64.mul
     (f64.const 2.3041729757376393e-05)
     (f64.const 365.24)
    )
    (f64.mul
     (f64.const 2.858859806661308e-04)
     (get_global $SOLAR_MASS)
    )
   )
  )
 )
 (func $Uranus (type $i) (result i32)
  (return
   (call $Body
    (call $lib:memset
     (call $lib:malloc
      (i32.const 56)
     )
     (i32.const 0)
     (i32.const 56)
    )
    (f64.const 12.894369562139131)
    (f64.const -15.111151401698631)
    (f64.const -0.22330757889265573)
    (f64.mul
     (f64.const 0.002964601375647616)
     (f64.const 365.24)
    )
    (f64.mul
     (f64.const 2.3784717395948095e-03)
     (f64.const 365.24)
    )
    (f64.mul
     (f64.const -2.9658956854023756e-05)
     (f64.const 365.24)
    )
    (f64.mul
     (f64.const 4.366244043351563e-05)
     (get_global $SOLAR_MASS)
    )
   )
  )
 )
 (func $Neptune (type $i) (result i32)
  (return
   (call $Body
    (call $lib:memset
     (call $lib:malloc
      (i32.const 56)
     )
     (i32.const 0)
     (i32.const 56)
    )
    (f64.const 15.379697114850917)
    (f64.const -25.919314609987964)
    (f64.const 0.17925877295037118)
    (f64.mul
     (f64.const 2.6806777249038932e-03)
     (f64.const 365.24)
    )
    (f64.mul
     (f64.const 0.001628241700382423)
     (f64.const 365.24)
    )
    (f64.mul
     (f64.const -9.515922545197159e-05)
     (f64.const 365.24)
    )
    (f64.mul
     (f64.const 5.1513890204661145e-05)
     (get_global $SOLAR_MASS)
    )
   )
  )
 )
 (func $Body#offsetMomentum (type $iFFFi) (param $0 i32) (param $1 f64) (param $2 f64) (param $3 f64) (result i32)
  (f64.store offset=24
   (get_local $0)
   (f64.div
    (f64.neg
     (get_local $1)
    )
    (get_global $SOLAR_MASS)
   )
  )
  (f64.store offset=32
   (get_local $0)
   (f64.div
    (f64.neg
     (get_local $2)
    )
    (get_global $SOLAR_MASS)
   )
  )
  (f64.store offset=40
   (get_local $0)
   (f64.div
    (f64.neg
     (get_local $3)
    )
    (get_global $SOLAR_MASS)
   )
  )
  (return
   (get_local $0)
  )
 )
 (func $NBodySystem (type $iii) (param $0 i32) (param $1 i32) (result i32)
  (local $2 f64)
  (local $3 f64)
  (local $4 f64)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 f64)
  (set_local $2
   (f64.const 0)
  )
  (set_local $3
   (f64.const 0)
  )
  (set_local $4
   (f64.const 0)
  )
  (set_local $5
   (i32.load offset=4
    (get_local $1)
   )
  )
  (block $break$1.1
   (set_local $6
    (i32.const 0)
   )
   (loop $continue$1.1
    (if
     (i32.lt_u
      (get_local $6)
      (get_local $5)
     )
     (block
      (block
       (set_local $7
        (i32.load offset=8
         (i32.add
          (get_local $1)
          (i32.mul
           (get_local $6)
           (i32.const 4)
          )
         )
        )
       )
       (set_local $8
        (f64.load offset=48
         (get_local $7)
        )
       )
       (set_local $2
        (f64.add
         (get_local $2)
         (f64.mul
          (f64.load offset=24
           (get_local $7)
          )
          (get_local $8)
         )
        )
       )
       (set_local $3
        (f64.add
         (get_local $3)
         (f64.mul
          (f64.load offset=32
           (get_local $7)
          )
          (get_local $8)
         )
        )
       )
       (set_local $4
        (f64.add
         (get_local $4)
         (f64.mul
          (f64.load offset=40
           (get_local $7)
          )
          (get_local $8)
         )
        )
       )
      )
      (set_local $6
       (i32.add
        (get_local $6)
        (i32.const 1)
       )
      )
      (br $continue$1.1)
     )
    )
   )
  )
  (i32.store
   (get_local $0)
   (get_local $1)
  )
  (drop
   (call $Body#offsetMomentum
    (i32.load offset=8
     (i32.load
      (get_local $0)
     )
    )
    (get_local $2)
    (get_local $3)
    (get_local $4)
   )
  )
  (return
   (get_local $0)
  )
 )
 (func $NBodySystem#advance (type $iFv) (param $0 i32) (param $1 f64)
  (local $2 f64)
  (local $3 f64)
  (local $4 f64)
  (local $5 f64)
  (local $6 f64)
  (local $7 f64)
  (local $8 f64)
  (local $9 f64)
  (local $10 f64)
  (local $11 f64)
  (local $12 f64)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  (local $16 i32)
  (local $17 f64)
  (local $18 i32)
  (local $19 i32)
  (local $20 f64)
  (local $21 f64)
  (local $22 f64)
  (nop)
  (set_local $13
   (i32.load
    (get_local $0)
   )
  )
  (set_local $14
   (i32.load offset=4
    (get_local $13)
   )
  )
  (block $break$1.1
   (set_local $15
    (i32.const 0)
   )
   (loop $continue$1.1
    (if
     (i32.lt_u
      (get_local $15)
      (get_local $14)
     )
     (block
      (block
       (set_local $16
        (i32.load offset=8
         (i32.add
          (get_local $13)
          (i32.mul
           (get_local $15)
           (i32.const 4)
          )
         )
        )
       )
       (set_local $5
        (f64.load
         (get_local $16)
        )
       )
       (set_local $6
        (f64.load offset=8
         (get_local $16)
        )
       )
       (set_local $7
        (f64.load offset=16
         (get_local $16)
        )
       )
       (set_local $8
        (f64.load offset=24
         (get_local $16)
        )
       )
       (set_local $9
        (f64.load offset=32
         (get_local $16)
        )
       )
       (set_local $10
        (f64.load offset=40
         (get_local $16)
        )
       )
       (set_local $17
        (f64.load offset=48
         (get_local $16)
        )
       )
       (block $break$1.2
        (set_local $18
         (i32.add
          (get_local $15)
          (i32.const 1)
         )
        )
        (loop $continue$1.2
         (if
          (i32.lt_u
           (get_local $18)
           (get_local $14)
          )
          (block
           (block
            (set_local $19
             (i32.load offset=8
              (i32.add
               (get_local $13)
               (i32.mul
                (get_local $18)
                (i32.const 4)
               )
              )
             )
            )
            (set_local $2
             (f64.sub
              (get_local $5)
              (f64.load
               (get_local $19)
              )
             )
            )
            (set_local $3
             (f64.sub
              (get_local $6)
              (f64.load offset=8
               (get_local $19)
              )
             )
            )
            (set_local $4
             (f64.sub
              (get_local $7)
              (f64.load offset=16
               (get_local $19)
              )
             )
            )
            (set_local $20
             (f64.add
              (f64.add
               (f64.mul
                (get_local $2)
                (get_local $2)
               )
               (f64.mul
                (get_local $3)
                (get_local $3)
               )
              )
              (f64.mul
               (get_local $4)
               (get_local $4)
              )
             )
            )
            (set_local $11
             (f64.sqrt
              (get_local $20)
             )
            )
            (set_local $12
             (f64.div
              (get_local $1)
              (f64.mul
               (get_local $20)
               (get_local $11)
              )
             )
            )
            (set_local $21
             (f64.mul
              (get_local $17)
              (get_local $12)
             )
            )
            (set_local $22
             (f64.mul
              (f64.load offset=48
               (get_local $19)
              )
              (get_local $12)
             )
            )
            (set_local $8
             (f64.sub
              (get_local $8)
              (f64.mul
               (get_local $2)
               (get_local $22)
              )
             )
            )
            (set_local $9
             (f64.sub
              (get_local $9)
              (f64.mul
               (get_local $3)
               (get_local $22)
              )
             )
            )
            (set_local $10
             (f64.sub
              (get_local $10)
              (f64.mul
               (get_local $4)
               (get_local $22)
              )
             )
            )
            (f64.store offset=24
             (get_local $19)
             (f64.mul
              (get_local $2)
              (get_local $21)
             )
            )
            (f64.store offset=32
             (get_local $19)
             (f64.mul
              (get_local $3)
              (get_local $21)
             )
            )
            (f64.store offset=40
             (get_local $19)
             (f64.mul
              (get_local $4)
              (get_local $21)
             )
            )
           )
           (set_local $18
            (i32.add
             (get_local $18)
             (i32.const 1)
            )
           )
           (br $continue$1.2)
          )
         )
        )
       )
       (f64.store offset=24
        (get_local $16)
        (get_local $8)
       )
       (f64.store offset=32
        (get_local $16)
        (get_local $9)
       )
       (f64.store offset=40
        (get_local $16)
        (get_local $10)
       )
       (f64.store
        (get_local $16)
        (f64.mul
         (get_local $1)
         (get_local $8)
        )
       )
       (f64.store offset=8
        (get_local $16)
        (f64.mul
         (get_local $1)
         (get_local $9)
        )
       )
       (f64.store offset=16
        (get_local $16)
        (f64.mul
         (get_local $1)
         (get_local $10)
        )
       )
      )
      (set_local $15
       (i32.add
        (get_local $15)
        (i32.const 1)
       )
      )
      (br $continue$1.1)
     )
    )
   )
  )
 )
 (func $NBodySystem#energy (type $iF) (param $0 i32) (result f64)
  (local $1 f64)
  (local $2 f64)
  (local $3 f64)
  (local $4 f64)
  (local $5 f64)
  (local $6 f64)
  (local $7 f64)
  (local $8 f64)
  (local $9 f64)
  (local $10 f64)
  (local $11 f64)
  (local $12 f64)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  (local $16 i32)
  (local $17 i32)
  (local $18 i32)
  (nop)
  (nop)
  (set_local $12
   (f64.const 0)
  )
  (set_local $13
   (i32.load
    (get_local $0)
   )
  )
  (set_local $14
   (i32.load offset=4
    (get_local $13)
   )
  )
  (block $break$1.1
   (set_local $15
    (i32.const 0)
   )
   (loop $continue$1.1
    (if
     (i32.lt_u
      (get_local $15)
      (get_local $14)
     )
     (block
      (block
       (set_local $16
        (i32.load offset=8
         (i32.add
          (get_local $13)
          (i32.mul
           (get_local $15)
           (i32.const 4)
          )
         )
        )
       )
       (set_local $5
        (f64.load
         (get_local $16)
        )
       )
       (set_local $6
        (f64.load offset=8
         (get_local $16)
        )
       )
       (set_local $7
        (f64.load offset=16
         (get_local $16)
        )
       )
       (set_local $8
        (f64.load offset=24
         (get_local $16)
        )
       )
       (set_local $9
        (f64.load offset=32
         (get_local $16)
        )
       )
       (set_local $10
        (f64.load offset=40
         (get_local $16)
        )
       )
       (set_local $11
        (f64.load offset=48
         (get_local $16)
        )
       )
       (set_local $12
        (f64.add
         (get_local $12)
         (f64.mul
          (f64.mul
           (f64.const 0.5)
           (get_local $11)
          )
          (f64.add
           (f64.add
            (f64.mul
             (get_local $8)
             (get_local $8)
            )
            (f64.mul
             (get_local $9)
             (get_local $9)
            )
           )
           (f64.mul
            (get_local $10)
            (get_local $10)
           )
          )
         )
        )
       )
       (block $break$1.2
        (set_local $17
         (i32.add
          (get_local $15)
          (i32.const 1)
         )
        )
        (loop $continue$1.2
         (if
          (i32.lt_u
           (get_local $17)
           (get_local $14)
          )
          (block
           (block
            (set_local $18
             (i32.load offset=8
              (i32.add
               (get_local $13)
               (i32.mul
                (get_local $17)
                (i32.const 4)
               )
              )
             )
            )
            (set_local $1
             (f64.sub
              (get_local $5)
              (f64.load
               (get_local $18)
              )
             )
            )
            (set_local $2
             (f64.sub
              (get_local $6)
              (f64.load offset=8
               (get_local $18)
              )
             )
            )
            (set_local $3
             (f64.sub
              (get_local $7)
              (f64.load offset=16
               (get_local $18)
              )
             )
            )
            (set_local $4
             (f64.sqrt
              (f64.add
               (f64.add
                (f64.mul
                 (get_local $1)
                 (get_local $1)
                )
                (f64.mul
                 (get_local $2)
                 (get_local $2)
                )
               )
               (f64.mul
                (get_local $3)
                (get_local $3)
               )
              )
             )
            )
            (set_local $12
             (f64.sub
              (get_local $12)
              (f64.div
               (f64.mul
                (get_local $11)
                (f64.load offset=48
                 (get_local $18)
                )
               )
               (get_local $4)
              )
             )
            )
           )
           (set_local $17
            (i32.add
             (get_local $17)
             (i32.const 1)
            )
           )
           (br $continue$1.2)
          )
         )
        )
       )
      )
      (set_local $15
       (i32.add
        (get_local $15)
        (i32.const 1)
       )
      )
      (br $continue$1.1)
     )
    )
   )
  )
  (return
   (get_local $12)
  )
 )
 (func $test (type $iF) (param $0 i32) (result f64)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (set_local $1
   (call $std:Array<Body>
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
  (i32.store offset=8
   (get_local $1)
   (call $Sun)
  )
  (i32.store offset=8
   (i32.add
    (get_local $1)
    (i32.const 4)
   )
   (call $Jupiter)
  )
  (i32.store offset=8
   (i32.add
    (get_local $1)
    (i32.const 8)
   )
   (call $Saturn)
  )
  (i32.store offset=8
   (i32.add
    (get_local $1)
    (i32.const 12)
   )
   (call $Uranus)
  )
  (i32.store offset=8
   (i32.add
    (get_local $1)
    (i32.const 16)
   )
   (call $Neptune)
  )
  (set_local $2
   (call $NBodySystem
    (call $lib:memset
     (call $lib:malloc
      (i32.const 4)
     )
     (i32.const 0)
     (i32.const 4)
    )
    (get_local $1)
   )
  )
  (block $break$1.1
   (set_local $3
    (i32.const 0)
   )
   (loop $continue$1.1
    (if
     (i32.lt_u
      (get_local $3)
      (get_local $0)
     )
     (block
      (call $NBodySystem#advance
       (get_local $2)
       (f64.const 0.01)
      )
      (set_local $3
       (i32.add
        (get_local $3)
        (i32.const 1)
       )
      )
      (br $continue$1.1)
     )
    )
   )
  )
  (return
   (call $NBodySystem#energy
    (get_local $2)
   )
  )
 )
 (func $.start (type $v)
  (set_global $SOLAR_MASS
   (f64.mul
    (f64.mul
     (f64.const 4)
     (f64.const 3.141592653589793)
    )
    (f64.const 3.141592653589793)
   )
  )
 )
)
