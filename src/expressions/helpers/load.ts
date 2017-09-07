/** @module assemblyscript/expressions */ /** */

import * as ts from "../../typescript";
import { Expression } from "binaryen";
import { Compiler } from "../../compiler";
import { Type, TypeKind } from "../../reflection";
import { setReflectedType } from "../../util";

/** Helper compiling a load operation. */
export function compileLoad(compiler: Compiler, node: ts.Expression, type: Type, ptr: Expression, offset: number): Expression {
  const op = compiler.module;

  setReflectedType(node, type);

  switch (type.kind) {

    case TypeKind.byte:
      return op.i32.load8_u(offset, type.size, ptr);

    case TypeKind.sbyte:
      return op.i32.load8_s(offset, type.size, ptr);

    case TypeKind.short:
      return op.i32.load16_s(offset, type.size, ptr);

    case TypeKind.ushort:
      return op.i32.load16_u(offset, type.size, ptr);

    case TypeKind.int:
    case TypeKind.uint:
    case TypeKind.bool:
      return op.i32.load(offset, type.size, ptr);

    case TypeKind.long:
    case TypeKind.ulong:
      return op.i64.load(offset, type.size, ptr);

    case TypeKind.uintptr:
      if (type.size === 4)
        return op.i32.load(offset, type.size, ptr);
      else
        return op.i64.load(offset, type.size, ptr);

    case TypeKind.float:
      return op.f32.load(offset, type.size, ptr);

    case TypeKind.double:
      return op.f64.load(offset, type.size, ptr);
  }
  throw Error("unexpected type"); // should handle all possible types above
}

export default compileLoad;
