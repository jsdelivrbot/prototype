/** @module assemblyscript/expressions */ /** */

import * as ts from "../../typescript";
import { Expression } from "binaryen";
import { Compiler } from "../../compiler";
import { Type, TypeKind } from "../../reflection";
import { setReflectedType } from "../../util";

/** Helper compiling a store operation. */
export function compileStore(compiler: Compiler, node: ts.Expression, type: Type, ptr: Expression, offset: number, value: Expression): Expression {
  const op = compiler.module;

  setReflectedType(node, Type.void);

  switch (type.kind) {

    case TypeKind.byte:
    case TypeKind.sbyte:
      return op.i32.store8(offset, type.size, ptr, value);

    case TypeKind.short:
    case TypeKind.ushort:
      return op.i32.store16(offset, type.size, ptr, value);

    case TypeKind.int:
    case TypeKind.uint:
    case TypeKind.bool:
      return op.i32.store(offset, type.size, ptr, value);

    case TypeKind.long:
    case TypeKind.ulong:
      return op.i64.store(offset, type.size, ptr, value);

    case TypeKind.uintptr:
      if (type.size === 4)
        return op.i32.store(offset, type.size, ptr, value);
      else
        return op.i64.store(offset, type.size, ptr, value);

    case TypeKind.float:
      return op.f32.store(offset, type.size, ptr, value);

    case TypeKind.double:
      return op.f64.store(offset, type.size, ptr, value);
  }
  throw Error("unexpected type"); // should handle all possible types above
}

export default compileStore;
