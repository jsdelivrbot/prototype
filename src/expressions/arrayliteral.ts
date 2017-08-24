/** @module assemblyscript/expressions */ /** */

import * as binaryen from "binaryen";
import Compiler from "../compiler";
import compileNewArray from "./helpers/array";
import { tryParseLiteral } from "./literal";
import * as Long from "long";
import * as reflection from "../reflection";
import * as typescript from "../typescript";
import * as util from "../util";

/** Compiles an array literal expression. */
export function compileArrayLiteral(compiler: Compiler, node: typescript.ArrayLiteralExpression, contextualType: reflection.Type): binaryen.Expression {

  if (!contextualType.isArray)
    throw Error("array type expected"); // checked by typescript

  util.setReflectedType(node, contextualType);

  const arrayType = <reflection.Class>contextualType.underlyingClass;
  const elementType = arrayType.typeArgumentsMap.T.type;

  return compileNewArray(compiler, elementType, node.elements);
}

/** Tries to parse an array literal expression. Returns `null` if that's not possible. */
export function tryParseArrayLiteral(node: typescript.ArrayLiteralExpression, contextualType: reflection.Type): Array<number | Long | string | null> | null {

  if (!contextualType.isArray)
    throw Error("array type expected"); // checked by typescript

  const arrayType = <reflection.Class>contextualType.underlyingClass;
  const elementType = arrayType.typeArgumentsMap.T.type;
  const elementCount = node.elements.length;
  const values = new Array<number | Long | string | null>(elementCount);

  for (let i = 0; i < elementCount; ++i) {
    const element = node.elements[i];
    if (element.kind >= typescript.SyntaxKind.FirstLiteralToken && element.kind <= typescript.SyntaxKind.LastLiteralToken) {
      const value = tryParseLiteral(<typescript.LiteralExpression>element, elementType);
      if (value === null)
        return null;
      values[i] = value;
    } else if (element.kind === typescript.SyntaxKind.OmittedExpression)
      if (contextualType.isString)
        values[i] = null;
      else
        values[i] = contextualType.isLong ? Long.ZERO : 0;
    else
      return null;
  }

  return values;
}
