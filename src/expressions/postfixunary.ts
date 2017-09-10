/** @module assemblyscript/expressions */ /** */

import * as ts from "../typescript";
import { Expression } from "binaryen";
import { Compiler } from "../compiler";
import { Type, ReflectionObjectKind, VariableBase, LocalVariable } from "../reflection";
import { setReflectedType } from "../util";

/** Compiles a unary postfix expression. */
export function compilePostfixUnary(compiler: Compiler, node: ts.PostfixUnaryExpression, contextualType: Type): Expression {
  const op = compiler.module;

  setReflectedType(node, contextualType);

  if (node.operand.kind === ts.SyntaxKind.Identifier) {

    const reference = compiler.resolveReference(<ts.Identifier>node.operand, ReflectionObjectKind.LocalVariable | ReflectionObjectKind.GlobalVariable);
    if (reference instanceof VariableBase) {
      const variable = <VariableBase>reference;
      switch (node.operator) {

        case ts.SyntaxKind.PlusPlusToken:
        case ts.SyntaxKind.MinusMinusToken:
        {
          const cat = compiler.categoryOf(variable.type);
          const one = compiler.valueOf(variable.type, 1);
          const isIncrement = node.operator === ts.SyntaxKind.PlusPlusToken;
          const binaryenType = compiler.typeOf(variable.type);

          let calculate = (isIncrement ? cat.add : cat.sub).call(cat,
            variable instanceof LocalVariable
              ? op.getLocal(
                  variable.index,
                  binaryenType
                )
              : op.getGlobal(
                  variable.name,
                  binaryenType
                ),
            one
          );

          if (variable.type.isByte || variable.type.isShort)
            calculate = compiler.maybeConvertValue(node, calculate, Type.i32, variable.type, true); // mask or sign-extend

          if (contextualType === Type.void) {
            setReflectedType(node, Type.void);
            return variable instanceof LocalVariable
              ? op.setLocal((<LocalVariable>variable).index, calculate)
              : op.setGlobal(variable.name, calculate);
          }

          setReflectedType(node, variable.type);
          return (isIncrement ? cat.sub : cat.add).call(cat,
            variable instanceof LocalVariable
              ? op.teeLocal(variable.index, calculate)
              : op.block("", [
                  op.setGlobal(variable.name, calculate),
                  op.getGlobal(variable.name, binaryenType)
                ], binaryenType),
            one
          );
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
