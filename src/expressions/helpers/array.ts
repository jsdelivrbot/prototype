/** @module assemblyscript/expressions */ /** */

import * as binaryen from "binaryen";
import { Compiler } from "../../compiler";
import compileStore from "./store";
import * as reflection from "../../reflection";
import * as typescript from "../../typescript";

export function compileNewArray(compiler: Compiler, elementType: reflection.Type, elementsOrSize: typescript.NodeArray<typescript.Expression> | typescript.Expression[] | number): binaryen.Expression {
  const op = compiler.module;

  const elementCount = typeof elementsOrSize === "number" ? elementsOrSize : elementsOrSize.length;

  const binaryenUintptrType = compiler.typeOf(compiler.uintptrType);
  const binaryenElementSize = compiler.valueOf(reflection.intType, elementCount);

  // create a unique local holding a pointer to allocated memory
  const arrptr = compiler.currentFunction.addUniqueLocal(compiler.uintptrType, "arrptr");

  // initialize header
  const block = [
    // capacity: *(arrptr = malloc(...)) = elementSize
    op.i32.store(0, reflection.intType.size, op.teeLocal(arrptr.index,
      compiler.compileMallocInvocation(compiler.arrayHeaderSize + elementCount * elementType.size) // capacity + length + N * element
    ), binaryenElementSize),
    // length: *(arrptr + 4) = elementSize
    op.i32.store(reflection.intType.size, reflection.intType.size, op.getLocal(arrptr.index, binaryenUintptrType), binaryenElementSize)
  ];

  // initialize concrete values if specified
  if (Array.isArray(elementsOrSize))
    for (let i = 0; i < elementCount; ++i)
      block.push(
        compileStore(compiler, elementsOrSize[i], elementType,
          op.getLocal(arrptr.index, binaryenUintptrType),
          compiler.arrayHeaderSize + i * elementType.size,
          compiler.compileExpression(elementsOrSize[i], elementType, elementType)
        )
      );

  // return the pointer as the block's result
  block.push(
    op.getLocal(arrptr.index, binaryenUintptrType)
  );

  return op.block("", block, binaryenUintptrType);
}

export { compileNewArray as default };

/** Evaluates a numeric array initializer. Returns `null` if it isn't (a proper) one. */
export function evaluateNumericArrayInitializer(node: typescript.NewExpression, elementType: reflection.Type): number[] | null {
  if (!(
    elementType.isNumeric &&
    node.expression.kind === typescript.SyntaxKind.Identifier && typescript.getTextOfNode(node.expression) === "Array" &&
    node.arguments && node.arguments.length === 1 && node.arguments[0].kind === typescript.SyntaxKind.NumericLiteral
  ))
    return null;
  const length = parseInt((<typescript.NumericLiteral>node.arguments[0]).text, 10);
  if (length < 0 || length > 0x7fffffff)
    return null;
  const array = new Array(length);
  for (let i = 0; i < length; ++i)
    array[i] = 0;
  return array;
}

/** Evaluates a string literal as an array. */
export function evaluateStringLiteralAsArray(node: typescript.StringLiteral): number[] {
  const text = node.text;
  const array = <number[]><any>new Uint16Array(text.length);
  for (let i = 0; i < text.length; ++i)
    array[i] = text.charCodeAt(i);
  return array;
}

/** Evaluates a string initializer as an array. Returns `null` if it isn't (a proper) one. */
export function evaluateStringInitializerAsArray(node: typescript.NewExpression): number[] | null {
  if (!(
    node.expression.kind === typescript.SyntaxKind.Identifier && typescript.getTextOfNode(node.expression) === "String" &&
    node.arguments && node.arguments.length === 1 && node.arguments[0].kind === typescript.SyntaxKind.NumericLiteral
  ))
    return null;
  const length = parseInt((<typescript.NumericLiteral>node.arguments[0]).text, 10);
  if (length < 0 || length > 0x7fffffff)
    return null;
  const array = <number[]><any>new Uint16Array(length);
  for (let i = 0; i < length; ++i)
    array[i] = 0;
  return array;
}
