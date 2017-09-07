/** @module assemblyscript/expressions */ /** */

import * as ts from "../typescript";
import { Expression } from "binaryen";
import { Compiler } from "../compiler";
import { compileNewArray } from "./helpers/array";
import { Type, Class } from "../reflection";
import { setReflectedType } from "../util";

/** Compiles an array literal expression. */
export function compileArrayLiteral(compiler: Compiler, node: ts.ArrayLiteralExpression, contextualType: Type): Expression {

  if (!contextualType.isArray)
    throw Error("array type expected"); // checked by typescript

  setReflectedType(node, contextualType);

  const arrayType = <Class>contextualType.underlyingClass;
  const elementType = arrayType.typeArgumentsMap.T.type;

  return compileNewArray(compiler, elementType, node.elements);
}
