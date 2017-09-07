/**
 * Compiler components dealing with built-in functions.
 *
 * Functions exported by this module correspond to the respective built-in functions. Each takes
 * TypeScript AST-objects and compiles them to opcodes directly.
 *
 * @module assemblyscript/builtins
 */ /** */

import * as ts from "./typescript";
import { Expression, F32Operations, F64Operations } from "binaryen";
import { Compiler, LIB_PREFIX } from "./compiler";
import { compileLoad } from "./expressions/helpers/load";
import { compileStore } from "./expressions/helpers/store";
import { Type } from "./reflection";
import { getReflectedType, startsWith } from "./util";

/** Tests if the specified file is a library file. */
export function isLibraryFile(file: ts.SourceFile): boolean {
  return file.fileName === "assembly.d.ts";
}

/** Tests if the specified file is a standard file. */
export function isStandardFile(file: ts.SourceFile): boolean {
  return startsWith(file.fileName, "std/");
}

/** Tests if the specified function name corresponds to a built-in function. */
export function isBuiltinFunction(name: string, isGlobalName: boolean = true): boolean {
  if (isGlobalName) {
    // Builtins are declared in assembly.d.ts exclusively
    if (!startsWith(name, LIB_PREFIX)) return false;
    name = name.substring(LIB_PREFIX.length);
    const p = name.indexOf("<");
    if (p > -1)
      name = name.substring(0, p);
  }
  switch (name) {
    case "rotl":
    case "rotll":
    case "rotr":
    case "rotrl":
    case "clz":
    case "clzl":
    case "ctz":
    case "ctzl":
    case "popcnt":
    case "popcntl":
    case "abs":
    case "absf":
    case "ceil":
    case "ceilf":
    case "floor":
    case "floorf":
    case "sqrt":
    case "sqrtf":
    case "trunc":
    case "truncf":
    case "nearest":
    case "nearestf":
    case "min":
    case "minf":
    case "max":
    case "maxf":
    case "copysign":
    case "copysignf":
    case "reinterpreti":
    case "reinterpretl":
    case "reinterpretf":
    case "reinterpretd":
    case "current_memory":
    case "grow_memory":
    case "unreachable":
    case "load":
    case "store":
    case "sizeof":
    case "unsafe_cast":
    case "isNaN":
    case "isNaNf":
    case "isFinite":
    case "isFinitef":
      return true;
  }
  return false;
}

/** An array of the statically linked runtime function names. */
export const runtimeNames = [
  "memset",
  "memcpy",
  "memcmp",
  "init",
  "malloc",
  "realloc",
  "free",
  "gc_pause",
  "gc_resume",
  "gc_collect",
  "gc_alloc",
  "gc_realloc",
  "gc_retain",
  "gc_release"
];

/** Tests if the specified function name corresponds to a linked runtime function. */
export function isRuntimeFunction(name: string, isGlobalName: boolean = true): boolean {
  if (isGlobalName) {
    // Builtins are declared in assembly.d.ts exclusively
    if (!startsWith(name, LIB_PREFIX)) return false;
    name = name.substring(LIB_PREFIX.length);
    const p = name.indexOf("<");
    if (p > -1)
      name = name.substring(0, p);
  }
  return runtimeNames.indexOf(name) > -1;
}

/** Global variable values. */
export const globals: { [key: string]: number } = {
  [LIB_PREFIX + "NaN"]: NaN,
  [LIB_PREFIX + "NaNf"]: NaN,
  [LIB_PREFIX + "Infinity"]: Infinity,
  [LIB_PREFIX + "Infinityf"]: Infinity
};

/** A pair of TypeScript expressions. */
export interface TypeScriptExpressionPair {
  0: ts.Expression;
  1: ts.Expression;
}

/** A pair of Binaryen expressions. */
export interface BinaryenExpressionPair {
  0: Expression;
  1: Expression;
}

/** Compiles a sign-agnostic rotate left operation. */
export function rotl(compiler: Compiler, nodes: TypeScriptExpressionPair, exprs: BinaryenExpressionPair): Expression {
  const op = compiler.module;
  const leftType = getReflectedType(nodes[0]);
  const rightType = getReflectedType(nodes[1]);

  if (leftType === rightType) {

    switch (leftType) {

      case Type.i32:
      case Type.u32:
      case Type.usize32:
        return op.i32.rotl(exprs[0], exprs[1]);

      case Type.i64:
      case Type.u64:
      case Type.usize64:
        return op.i64.rotl(exprs[0], exprs[1]);
    }
  }
  throw Error("unsupported operation");
}

/** Compiles a sign-agnostic rotate right operation. */
export function rotr(compiler: Compiler, nodes: TypeScriptExpressionPair, exprs: BinaryenExpressionPair): Expression {
  const op = compiler.module;

  const leftType = getReflectedType(nodes[0]);
  const rightType = getReflectedType(nodes[1]);

  if (leftType === rightType) {
    switch (leftType) {

      case Type.i32:
      case Type.u32:
      case Type.usize32:
        return op.i32.rotr(exprs[0], exprs[1]);

      case Type.i64:
      case Type.u64:
      case Type.usize64:
        return op.i64.rotr(exprs[0], exprs[1]);
    }
  }
  throw Error("unsupported operation");
}

/** Compiles a sign-agnostic count leading zero bits operation. */
export function clz(compiler: Compiler, node: ts.Expression, expr: Expression): Expression {
  const op = compiler.module;

  const type = getReflectedType(node);
  switch (type) {

    case Type.i32:
    case Type.u32:
    case Type.usize32:
      return op.i32.clz(expr);

    case Type.i64:
    case Type.u64:
    case Type.usize64:
      return op.i64.clz(expr);
  }
  throw Error("unsupported operation");
}

/** Compiles a sign-agnostic count tailing zero bits operation. */
export function ctz(compiler: Compiler, node: ts.Expression, expr: Expression): Expression {
  const op = compiler.module;

  const type = getReflectedType(node);
  switch (type) {

    case Type.i32:
    case Type.u32:
    case Type.usize32:
      return op.i32.ctz(expr);

    case Type.i32:
    case Type.u32:
    case Type.usize32:
      return op.i64.ctz(expr);
  }
  throw Error("unsupported operation");
}

/** Compiles a sign-agnostic count number of one bits operation. */
export function popcnt(compiler: Compiler, node: ts.Expression, expr: Expression): Expression {
  const op = compiler.module;

  const type = getReflectedType(node);
  switch (type) {

    case Type.i32:
    case Type.u32:
    case Type.usize32:
      return op.i32.popcnt(expr);

    case Type.i32:
    case Type.u32:
    case Type.usize32:
      return op.i64.popcnt(expr);
  }
  throw Error("unsupported operation");
}

/** Compiles an absolute value operation. */
export function abs(compiler: Compiler, node: ts.Expression, expr: Expression): Expression {
  const op = compiler.module;

  const type = getReflectedType(node);
  switch (type) {

    case Type.f32:
      return op.f32.abs(expr);

    case Type.f64:
      return op.f64.abs(expr);
  }
  throw Error("unsupported operation");
}

/** Compiles a ceiling operation. */
export function ceil(compiler: Compiler, node: ts.Expression, expr: Expression): Expression {
  const op = compiler.module;

  const type = getReflectedType(node);
  switch (type) {

    case Type.f32:
      return op.f32.ceil(expr);

    case Type.f64:
      return op.f64.ceil(expr);
  }
  throw Error("unsupported operation");
}

/** Compiles a floor operation. */
export function floor(compiler: Compiler, node: ts.Expression, expr: Expression): Expression {
  const op = compiler.module;

  const type = getReflectedType(node);
  switch (type) {

    case Type.f32:
      return op.f32.floor(expr);

    case Type.f64:
      return op.f64.floor(expr);
  }
  throw Error("unsupported operation");
}

/** Compiles a square root operation. */
export function sqrt(compiler: Compiler, node: ts.Expression, expr: Expression): Expression {
  const op = compiler.module;

  const type = getReflectedType(node);
  switch (type) {

    case Type.f32:
      return op.f32.sqrt(expr);

    case Type.f64:
      return op.f64.sqrt(expr);
  }
  throw Error("unsupported operation");
}

/** Compiles a round to the nearest integer towards zero operation. */
export function trunc(compiler: Compiler, node: ts.Expression, expr: Expression): Expression {
  const op = compiler.module;

  const type = getReflectedType(node);
  switch (type) {

    case Type.f32:
      return op.f32.trunc(expr);

    case Type.f64:
      return op.f64.trunc(expr);
  }
  throw Error("unsupported operation");
}

/** Compiles a round to the nearest integer tied to even operation. */
export function nearest(compiler: Compiler, node: ts.Expression, expr: Expression): Expression {
  const op = compiler.module;

  const type = getReflectedType(node);
  switch (type) {

    case Type.f32:
      return op.f32.nearest(expr);

    case Type.f64:
      return op.f64.nearest(expr);
  }
  throw Error("unsupported operation");
}

/** Compiles a minimum of two floats operation. */
export function min(compiler: Compiler, nodes: TypeScriptExpressionPair, exprs: BinaryenExpressionPair): Expression {
  const op = compiler.module;

  const leftType = getReflectedType(nodes[0]);
  const rightType = getReflectedType(nodes[1]);

  if (leftType === rightType) {
    switch (leftType) {

      case Type.f32:
        return op.f32.min(exprs[0], exprs[1]);

      case Type.f64:
        return op.f64.min(exprs[0], exprs[1]);
    }
  }
  throw Error("unsupported operation");
}

/** Compiles a maximum of two floats operation. */
export function max(compiler: Compiler, nodes: TypeScriptExpressionPair, exprs: BinaryenExpressionPair): Expression {
  const op = compiler.module;

  const leftType = getReflectedType(nodes[0]);
  const rightType = getReflectedType(nodes[1]);

  if (leftType === rightType) {
    switch (leftType) {

      case Type.f32:
        return op.f32.max(exprs[0], exprs[1]);

      case Type.f64:
        return op.f64.max(exprs[0], exprs[1]);
    }
  }
  throw Error("unsupported operation");
}

/** Compiles a copysign operation that composes a float from the magnitude of `x` and the sign of `y`. */
export function copysign(compiler: Compiler, nodes: TypeScriptExpressionPair, exprs: BinaryenExpressionPair): Expression {
  const op = compiler.module;

  const leftType = getReflectedType(nodes[0]);
  const rightType = getReflectedType(nodes[1]);

  if (leftType === rightType) {
    switch (leftType) {

      case Type.f32:
        return op.f32.copysign(exprs[0], exprs[1]);

      case Type.f64:
        return op.f64.copysign(exprs[0], exprs[1]);
    }
  }
  throw Error("unsupported operation");
}

/** Compiles a reinterpretation of a float as an int respectively of an int as a float. */
export function reinterpret(compiler: Compiler, node: ts.Expression, expr: Expression): Expression {
  const op = compiler.module;

  const type = getReflectedType(node);
  switch (type) {

    case Type.i32:
    case Type.u32:
    case Type.usize32:
      return op.f32.reinterpret(expr);

    case Type.i64:
    case Type.u64:
    case Type.usize64:
      return op.f64.reinterpret(expr);

    case Type.f32:
      return op.i32.reinterpret(expr);

    case Type.f64:
      return op.i64.reinterpret(expr);

  }
  throw Error("unsupported operation");
}

/** Compiles a current memory operation. */
export function current_memory(compiler: Compiler): Expression {
  const op = compiler.module;
  return op.currentMemory();
}

/** Compiles a grow memory operation. */
export function grow_memory(compiler: Compiler, node: ts.Expression, expr: Expression): Expression {
  const op = compiler.module;

  const type = getReflectedType(node);
  if (type.isInt)
    return op.growMemory(expr);

  throw Error("unsupported operation");
}

/** Compiles an unreachable operation. */
export function unreachable(compiler: Compiler): Expression {
  const op = compiler.module;
  return op.unreachable();
}

/** Compiles a load from memory operation. */
export function load(compiler: Compiler, type: Type, node: ts.Expression, expr: Expression): Expression {
  const callNode = <ts.CallExpression>node.parent;
  return compileLoad(compiler, callNode, type, expr, 0);
}

/** Compiles a store to memory operation. */
export function store(compiler: Compiler, type: Type, nodes: TypeScriptExpressionPair, exprs: BinaryenExpressionPair): Expression {
  const callNode = <ts.CallExpression>nodes[0].parent;
  return compileStore(compiler, callNode, type, exprs[0], 0, exprs[1]);
}

/** Compiles a sizeof operation determining the byte size of a type. */
export function sizeof(compiler: Compiler, type: Type): Expression {
  const op = compiler.module;
  const size = type.underlyingClass ? type.underlyingClass.size : type.size;

  return compiler.usizeType === Type.usize32
    ? op.i32.const(size)
    : op.i64.const(size, 0); // TODO: long?
}

/** Compiles an unsafe cast operation casting a value from one type to another. */
export function unsafe_cast(expr: Expression): Expression {
  return expr;
}

/** Compiles a check for NaN operation. */
export function isNaN(compiler: Compiler, node: ts.Expression, expr: Expression): Expression {
  const op = compiler.module;

  const type = getReflectedType(node);
  if (!type.isAnyFloat)
    throw Error("unsupported operation");

  const category = <F32Operations | F64Operations>compiler.categoryOf(type);

  // value != value

  // Simplify if the argument is a single identifier or literal
  if (node.kind === ts.SyntaxKind.Identifier || node.kind === ts.SyntaxKind.NumericLiteral)
    return category.ne(expr, expr);

  // Otherwise evaluate the compound expression exactly once through introducing a temporary local
  const tempName = type.tempName;
  const temp = compiler.currentFunction.localsByName[tempName] || compiler.currentFunction.addLocal(tempName, type);
  const tempBinaryenType = compiler.typeOf(type);

  return category.ne(
    op.teeLocal(temp.localIndex, expr),
    op.getLocal(temp.localIndex, tempBinaryenType)
  );
}

/** Compiles a check for a finite number operation. */
export function isFinite(compiler: Compiler, node: ts.Expression, expr: Expression): Expression {
  const op = compiler.module;

  const type = getReflectedType(node);
  if (!type.isAnyFloat)
    throw Error("unsupported operation");

  const category = <F32Operations | F64Operations>compiler.categoryOf(type);

  // !(value != value) && abs(value) != Infinity

  // Simplify if the argument is a single identifier or literal
  if (node.kind === ts.SyntaxKind.Identifier || node.kind === ts.SyntaxKind.NumericLiteral)
    return op.select(
      category.ne(expr, expr),
      op.i32.const(0),
      category.ne(
        category.abs(expr),
        compiler.valueOf(type, Infinity)
      )
    );

  // Otherwise evaluate the compound expression exactly once through introducing a temporary local
  const tempName = type.tempName;
  const temp = compiler.currentFunction.localsByName[tempName] || compiler.currentFunction.addLocal(tempName, type);
  const tempBinaryenType = compiler.typeOf(type);

  return op.select(
    category.ne(
      op.teeLocal(temp.localIndex, expr),
      op.getLocal(temp.localIndex, tempBinaryenType)
    ),
    op.i32.const(0),
    category.ne(
      category.abs(
        op.getLocal(temp.localIndex, tempBinaryenType)
      ),
      compiler.valueOf(type, Infinity)
    )
  );
}

export function internal_fmod(compiler: Compiler, nodes: TypeScriptExpressionPair, exprs: BinaryenExpressionPair): Expression {
  const op = compiler.module;

  const xType = getReflectedType(nodes[0]);
  const yType = getReflectedType(nodes[1]);

  if (!(xType === Type.f64 && yType === Type.f64) && !(xType === Type.f32 && yType === Type.f32))
    throw Error("unsupported operation: " + xType + " / " + yType);

  // FIXME: this is a naive implementation

  const tempName = xType.tempName;
  const temp = compiler.currentFunction.localsByName[tempName] || compiler.currentFunction.addLocal(tempName, xType);
  const tempBinaryenType = compiler.typeOf(xType);

  return xType === Type.f64
    // x - (((x / y) as long) as double) * y
    ? op.f64.sub(
      op.teeLocal(temp.localIndex, exprs[0]), // evaluate x
      op.f64.mul(
        op.f64.convert_s.i64(
          op.i64.trunc_s.f64(
            op.f64.div(
              op.getLocal(temp.localIndex, tempBinaryenType), // reuse evaluated x
              op.teeLocal(temp.localIndex, exprs[1]) // evalute y
            )
          )
        ),
        op.getLocal(temp.localIndex, tempBinaryenType) // reuse evaluated y
      )
    )
    // x - (((x / y) as long) as float) * y
    : op.f32.sub(
      op.teeLocal(temp.localIndex, exprs[0]), // evaluate x
      op.f32.mul(
        op.f32.convert_s.i64(
          op.i64.trunc_s.f32(
            op.f32.div(
              op.getLocal(temp.localIndex, tempBinaryenType), // reuse evaluated x
              op.teeLocal(temp.localIndex, exprs[1]) // evalute y
            )
          )
        ),
        op.getLocal(temp.localIndex, tempBinaryenType) // reuse evaluated y
      )
    );
}
