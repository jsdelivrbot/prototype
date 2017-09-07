/** @module assemblyscript/expressions */ /** */

import * as ts from "../typescript";
import { Expression } from "binaryen";
import { Compiler } from "../compiler";
import { Type } from "../reflection";
import { setReflectedType } from "../util";

/** Compiles a unary postfix expression. */
export function compilePostfixUnary(compiler: Compiler, node: ts.PostfixUnaryExpression, contextualType: Type): Expression {
  const op = compiler.module;

  setReflectedType(node, contextualType);

  if (node.operand.kind === ts.SyntaxKind.Identifier) {

    const localName = ts.getTextOfNode(node.operand);
    const local = compiler.currentFunction.localsByName[localName];
    if (local) {

      switch (node.operator) {

        case ts.SyntaxKind.PlusPlusToken:
        case ts.SyntaxKind.MinusMinusToken:
        {
          const cat = compiler.categoryOf(local.type);
          const one = compiler.valueOf(local.type, 1);
          const isIncrement = node.operator === ts.SyntaxKind.PlusPlusToken;

          let calculate = (isIncrement ? cat.add : cat.sub).call(cat,
            op.getLocal(
              local.localIndex,
              compiler.typeOf(local.type)
            ),
            one
          );

          if (local.type.isByte || local.type.isShort)
            calculate = compiler.maybeConvertValue(node, calculate, Type.i32, local.type, true); // mask or sign-extend

          if (contextualType === Type.void) {
            setReflectedType(node, Type.void);
            return op.setLocal(local.localIndex, calculate);
          } else {
            setReflectedType(node, local.type);
            return (isIncrement ? cat.sub : cat.add).call(cat, op.teeLocal(local.localIndex, calculate), one);
          }
        }
        default:
          compiler.report(node, ts.DiagnosticsEx.Unsupported_node_kind_0_in_1, node.operator, "expressions.compilePostfixUnary/1");
          return op.unreachable();
      }
    }
  }

  compiler.report(node, ts.DiagnosticsEx.Unsupported_node_kind_0_in_1, node.operand.kind, "expressions.compilePostfixUnary/2");
  return op.unreachable();
}

export default compilePostfixUnary;
