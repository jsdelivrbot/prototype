/** @module assemblyscript/expressions */ /** */

import * as ts from "../../typescript";
import { Expression } from "binaryen";
import { Compiler } from "../../compiler";
import { compileStore } from "./store";
import { Type } from "../../reflection";

export function compileNewArray(compiler: Compiler, elementType: Type, elementsOrSize: ts.NodeArray<ts.Expression> | ts.Expression[] | number): Expression {
  const op = compiler.module;

  const elementCount = typeof elementsOrSize === "number" ? elementsOrSize : elementsOrSize.length;

  const binaryenUsizeType = compiler.typeOf(compiler.usizeType);
  const binaryenElementSize = compiler.valueOf(Type.i32, elementCount);

  // create a unique local holding a pointer to allocated memory
  const arrptr = compiler.currentFunction.addUniqueLocal(compiler.usizeType, "arrptr");

  // initialize header
  const block = [
    // capacity: *(arrptr = malloc(...)) = elementSize
    op.i32.store(0, Type.i32.size, op.teeLocal(arrptr.localIndex,
      compiler.compileMallocInvocation(compiler.arrayHeaderSize + elementCount * elementType.size) // capacity + length + N * element
    ), binaryenElementSize),
    // length: *(arrptr + 4) = elementSize
    op.i32.store(Type.i32.size, Type.i32.size, op.getLocal(arrptr.localIndex, binaryenUsizeType), binaryenElementSize)
  ];

  // initialize concrete values if specified
  if (Array.isArray(elementsOrSize))
    for (let i = 0; i < elementCount; ++i)
      block.push(
        compileStore(compiler, elementsOrSize[i], elementType,
          op.getLocal(arrptr.localIndex, binaryenUsizeType),
          compiler.arrayHeaderSize + i * elementType.size,
          compiler.compileExpression(elementsOrSize[i], elementType, elementType)
        )
      );

  // return the pointer as the block's result
  block.push(
    op.getLocal(arrptr.localIndex, binaryenUsizeType)
  );

  return op.block("", block, binaryenUsizeType);
}

export default compileNewArray;

/** Evaluates a numeric array initializer. Returns `null` if it isn't (a proper) one. */
export function evaluateNumericArrayInitializer(node: ts.NewExpression, elementType: Type): number[] | null {
  if (!(
    elementType.isNumeric &&
    node.expression.kind === ts.SyntaxKind.Identifier && ts.getTextOfNode(node.expression) === "Array" &&
    node.arguments && node.arguments.length === 1 && node.arguments[0].kind === ts.SyntaxKind.NumericLiteral
  ))
    return null;
  const length = parseInt((<ts.NumericLiteral>node.arguments[0]).text, 10);
  if (length < 0 || length > 0x7fffffff)
    return null;
  const array = new Array(length);
  for (let i = 0; i < length; ++i)
    array[i] = 0;
  return array;
}

/** Evaluates a string literal as an array. */
export function evaluateStringLiteralAsArray(node: ts.StringLiteral): number[] {
  const text = node.text;
  const array = <number[]><any>new Uint16Array(text.length);
  for (let i = 0; i < text.length; ++i)
    array[i] = text.charCodeAt(i);
  return array;
}

/** Evaluates a string initializer as an array. Returns `null` if it isn't (a proper) one. */
export function evaluateStringInitializerAsArray(node: ts.NewExpression): number[] | null {
  if (!(
    node.expression.kind === ts.SyntaxKind.Identifier && ts.getTextOfNode(node.expression) === "String" &&
    node.arguments && node.arguments.length === 1 && node.arguments[0].kind === ts.SyntaxKind.NumericLiteral
  ))
    return null;
  const length = parseInt((<ts.NumericLiteral>node.arguments[0]).text, 10);
  if (length < 0 || length > 0x7fffffff)
    return null;
  const array = <number[]><any>new Uint16Array(length);
  for (let i = 0; i < length; ++i)
    array[i] = 0;
  return array;
}
