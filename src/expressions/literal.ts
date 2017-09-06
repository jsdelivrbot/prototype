/** @module assemblyscript/expressions */ /** */

import * as binaryen from "binaryen";
import Compiler from "../compiler";
import * as Long from "long";
import { tryParseLiteral } from "../parser";
import * as reflection from "../reflection";
import * as typescript from "../typescript";
import * as util from "../util";

/** Compiles a literal expression. */
export function compileLiteral(compiler: Compiler, node: typescript.LiteralExpression, contextualType: reflection.Type, negate: boolean = false): binaryen.Expression {
  const op = compiler.module;

  util.setReflectedType(node, contextualType);

  switch (node.kind) {
    case typescript.SyntaxKind.TrueKeyword:
      negate = !negate;

    case typescript.SyntaxKind.FalseKeyword:
      util.setReflectedType(node, reflection.boolType);
      return negate
        ? contextualType.isLong ? op.i64.const(1, 0) : op.i32.const(1)
        : contextualType.isLong ? op.i64.const(0, 0) : op.i32.const(0);

    case typescript.SyntaxKind.NullKeyword:
      if (contextualType.isClass) {
        if (contextualType.isNullable)
          util.setReflectedType(node, contextualType);
        else {
          const nullableType = contextualType.asNullable();
          util.setReflectedType(node, nullableType);
          compiler.report(node, typescript.DiagnosticsEx.Types_0_and_1_are_incompatible, contextualType.toString(), nullableType.toString());
        }
      } else
        util.setReflectedType(node, compiler.uintptrType);
      return compiler.uintptrSize === 4 ? op.i32.const(0) : op.i64.const(0, 0);

    case typescript.SyntaxKind.NumericLiteral:
    {
      const parsed = tryParseLiteral(node, contextualType, negate);
      if (parsed === null) {
        compiler.report(node, typescript.DiagnosticsEx.Unsupported_literal_0, typescript.getTextOfNode(node));
        return op.unreachable();
      }
      switch (contextualType) {

        case reflection.floatType:
          return op.f32.const(<number>parsed);

        case reflection.doubleType:
          return op.f64.const(<number>parsed);

        case reflection.longType:
        case reflection.ulongType:
        case reflection.uintptrType64:
          return op.i64.const((<Long>parsed).low, (<Long>parsed).high);

      }
      return op.i32.const(<number>parsed);
    }

    case typescript.SyntaxKind.StringLiteral:
    {
      const text = node.text;
      const offset = compiler.memory.createString(text, true).offset;
      return compiler.valueOf(compiler.uintptrType, offset);
    }
  }

  compiler.report(node, typescript.DiagnosticsEx.Unsupported_literal_0, typescript.getTextOfNode(node));
  return op.unreachable();
}

export { compileLiteral as default };
