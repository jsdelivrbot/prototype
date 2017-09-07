/** @module assemblyscript/expressions */ /** */

import * as ts from "../typescript";
import { Expression } from "binaryen";
import { Compiler } from "../compiler";
import { Type } from "../reflection";
import { setReflectedType } from "../util";

/** Compiles an 'as' expression explicitly converting from one type to another. */
export function compileAs(compiler: Compiler, node: ts.AssertionExpression, contextualType: Type): Expression {
  const op = compiler.module;
  const toType = compiler.resolveType(node.type, false, compiler.currentFunction.typeArgumentsMap); // reports

  if (toType) {
    setReflectedType(node, toType);
    return compiler.compileExpression(node.expression, toType, toType, true);
  }

  setReflectedType(node, contextualType);
  return op.unreachable();
}

export default compileAs;
