/** @module assemblyscript/expressions */ /** */

import * as ts from "../typescript";
import { Expression } from "binaryen";
import { Compiler } from "../compiler";
import { Type } from "../reflection";
import { getReflectedType, setReflectedType } from "../util";

/** Compiles a parenthesized expression. */
export function compileParenthesized(compiler: Compiler, node: ts.ParenthesizedExpression, contextualType: Type): Expression {
  const expression = compiler.compileExpression(node.expression, contextualType);

  setReflectedType(node, getReflectedType(node.expression));
  return expression;
}

export default compileParenthesized;
