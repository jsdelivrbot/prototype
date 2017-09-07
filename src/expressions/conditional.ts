/** @module assemblyscript/expressions */ /** */

import * as ts from "../typescript";
import { Expression } from "binaryen";
import { Compiler } from "../compiler";
import { Type } from "../reflection";
import { setReflectedType } from "../util";

/** Compiles a conditional (ternary) expression. */
export function compileConditional(compiler: Compiler, node: ts.ConditionalExpression, contextualType: Type): Expression {
  const op = compiler.module;

  const condition = compiler.compileExpression(node.condition, Type.i32, Type.i32, true);
  const ifTrue    = compiler.compileExpression(node.whenTrue, contextualType, contextualType, false);
  const ifFalse   = compiler.compileExpression(node.whenFalse, contextualType, contextualType, false);

  setReflectedType(node, contextualType);
  return op.select(condition, ifTrue, ifFalse);
}

export default compileConditional;
