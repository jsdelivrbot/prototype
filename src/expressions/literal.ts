/** @module assemblyscript/expressions */ /** */

import * as ts from "../typescript";
import * as Long from "long";
import { Expression } from "binaryen";
import { Compiler } from "../compiler";
import { tryParseLiteral } from "../parser";
import { Type } from "../reflection";
import { setReflectedType } from "../util";

/** Compiles a literal expression. */
export function compileLiteral(compiler: Compiler, node: ts.LiteralExpression, contextualType: Type, negate: boolean = false): Expression {
  const op = compiler.module;

  setReflectedType(node, contextualType);

  switch (node.kind) {
    case ts.SyntaxKind.TrueKeyword:
      negate = !negate;

    case ts.SyntaxKind.FalseKeyword:
      setReflectedType(node, Type.bool);
      return negate
        ? contextualType.isLong ? op.i64.const(1, 0) : op.i32.const(1)
        : contextualType.isLong ? op.i64.const(0, 0) : op.i32.const(0);

    case ts.SyntaxKind.NullKeyword:
      if (contextualType.isClass) {
        if (contextualType.isNullable)
          setReflectedType(node, contextualType);
        else {
          const nullableType = contextualType.asNullable();
          setReflectedType(node, nullableType);
          compiler.report(node, ts.DiagnosticsEx.Types_0_and_1_are_incompatible, contextualType.toString(), nullableType.toString());
        }
      } else
        setReflectedType(node, compiler.uintptrType);
      return compiler.uintptrSize === 4 ? op.i32.const(0) : op.i64.const(0, 0);

    case ts.SyntaxKind.NumericLiteral:
    {
      const parsed = tryParseLiteral(node, contextualType, negate);
      if (parsed === null) {
        compiler.report(node, ts.DiagnosticsEx.Unsupported_literal_0, ts.getTextOfNode(node));
        return op.unreachable();
      }
      switch (contextualType) {

        case Type.f32:
          return op.f32.const(<number>parsed);

        case Type.f64:
          return op.f64.const(<number>parsed);

        case Type.i64:
        case Type.u64:
        case Type.usize64:
          return op.i64.const((<Long>parsed).low, (<Long>parsed).high);

      }
      return op.i32.const(<number>parsed);
    }

    case ts.SyntaxKind.StringLiteral:
    {
      const text = node.text;
      const offset = compiler.memory.createString(text, true).offset;
      return compiler.valueOf(compiler.uintptrType, offset);
    }
  }

  compiler.report(node, ts.DiagnosticsEx.Unsupported_literal_0, ts.getTextOfNode(node));
  return op.unreachable();
}

export default compileLiteral;
