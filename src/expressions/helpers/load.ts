/** @module assemblyscript/expressions */ /** */

import { Expression } from "binaryen";
import { Compiler } from "../../compiler";
import { Type, TypeKind } from "../../reflection";

/** Helper compiling a load operation. */
export function compileLoad(compiler: Compiler, type: Type, ptr: Expression, offset: number): Expression {
  const op = compiler.module;

  switch (type.kind) {

    case TypeKind.u8:
      return op.i32.load8_u(offset, type.size, ptr);

    case TypeKind.i8:
      return op.i32.load8_s(offset, type.size, ptr);

    case TypeKind.i16:
      return op.i32.load16_s(offset, type.size, ptr);

    case TypeKind.u16:
      return op.i32.load16_u(offset, type.size, ptr);

    case TypeKind.i32:
    case TypeKind.u32:
    case TypeKind.bool:
      return op.i32.load(offset, type.size, ptr);

    case TypeKind.i64:
    case TypeKind.u64:
      return op.i64.load(offset, type.size, ptr);

    case TypeKind.usize:
      if (type.size === 4)
        return op.i32.load(offset, type.size, ptr);
      else
        return op.i64.load(offset, type.size, ptr);

    case TypeKind.f32:
      return op.f32.load(offset, type.size, ptr);

    case TypeKind.f64:
      return op.f64.load(offset, type.size, ptr);
  }
  throw Error("unexpected type"); // should handle all possible types above
}

export default compileLoad;
