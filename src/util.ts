/**
 * Utility functions.
 * @module assemblyscript/util
 */ /** */

import * as ts from "./typescript";
import * as wabt from "wabt";
import { Type, Function, FunctionTemplate, Class, ClassTemplate } from "./reflection";

/** Tests if the specified node, or optionally either its parent, has an 'export' modifier. */
export function isExport(node: ts.Node, checkParent: boolean = false): boolean {
  if (node && node.modifiers)
    for (let i = 0, k = node.modifiers.length; i < k; ++i)
      if (node.modifiers[i].kind === ts.SyntaxKind.ExportKeyword)
        return true;
  if (checkParent && node.parent && node.parent.kind === ts.SyntaxKind.ClassDeclaration)
    return isExport(node.parent);
  return false;
}

/** Tests if the specified node, or optionally either its parent, has a 'declare' modifier. */
export function isDeclare(node: ts.Node, checkParent: boolean = false): boolean {
  if (node && node.modifiers)
    for (let i = 0, k = node.modifiers.length; i < k; ++i)
      if (node.modifiers[i].kind === ts.SyntaxKind.DeclareKeyword)
        return true;
  if (checkParent && node.parent && node.parent.kind === ts.SyntaxKind.ClassDeclaration)
    return isDeclare(node.parent);
  return false;
}

/** Tests if the specified node has a 'static' modifier or is otherwise part of a static context. */
export function isStatic(node: ts.Node): boolean {
  return (<ts.ModifierFlags>node.modifierFlagsCache & ts.ModifierFlags.Static) !== 0;
}

/** Tests if the specified node has an 'abstract' modifier. */
export function isAbstract(node: ts.Node): boolean {
  return (<ts.ModifierFlags>node.modifierFlagsCache & ts.ModifierFlags.Abstract) !== 0;
}

/** Tests if the specified node is flagged 'const'. */
export function isConst(node: ts.Node): boolean {
  return (node.flags & ts.NodeFlags.Const) !== 0;
}

/** Gets the reflected type of an expression. */
export function getReflectedType(node: ts.Expression): Type {
  return <Type>(<any>node).reflectedType || null;
}

/** Sets the reflected type of an expression. */
export function setReflectedType(node: ts.Expression, type: Type): void {
  if (!type) throw Error("type cannot be null");
  (<any>node).reflectedType = type;
}

/** Gets the reflected function instance (describing a function with generic types resolved) of a function declaration. */
export function getReflectedFunction(node: ts.FunctionLikeDeclaration): Function {
  return <Function>(<any>node).reflectedFunction || null;
}

/** Sets the reflected function instance (describing a function with generic types resolved) of a function declaration. */
export function setReflectedFunction(node: ts.FunctionLikeDeclaration, instance: Function): void {
  if (!instance)
    throw Error("instance cannot be null");
  if (instance.isGeneric)
    throw Error("instance cannot be generic");
  (<any>node).reflectedFunction = instance;
}

/** Gets the reflected function template (describing a function with unresolved generic types) of a function declaration. */
export function getReflectedFunctionTemplate(node: ts.FunctionLikeDeclaration): FunctionTemplate {
  return <FunctionTemplate>(<any>node).reflectedFunctionTemplate || null;
}

/** Sets the reflected function template (describing a function with unresolved generic types) of a function declaration. */
export function setReflectedFunctionTemplate(node: ts.FunctionLikeDeclaration, template: FunctionTemplate): void {
  if (!template)
    throw Error("template cannot be null");
  (<any>node).reflectedFunctionTemplate = template;
}

/** Gets the reflected class instance (describing a class with generic types resolved) of a class declaration. */
export function getReflectedClass(node: ts.ClassDeclaration): Class {
  return <Class>(<any>node).reflectedClass || null;
}

/** Sets the reflected class instance (describing a class with generic types resolved) of a class declaration. */
export function setReflectedClass(node: ts.ClassDeclaration, instance: Class): void {
  if (!instance)
    throw Error("instance cannot be null");
  if (instance.isGeneric)
    throw Error("instance cannot be generic");
  (<any>node).reflectedClass = instance;
}

/** Gets the reflected class template (describing a class with unresolved generic types) of a class declaration. */
export function getReflectedClassTemplate(node: ts.ClassDeclaration): ClassTemplate {
  return <ClassTemplate>(<any>node).reflectedClassTemplate || null;
}

/** Sets the reflected class template (describing a class with unresolved generic types) of a class declaration. */
export function setReflectedClassTemplate(node: ts.ClassDeclaration, template: ClassTemplate): void {
  if (!template)
    throw Error("template cannot be null");
  (<any>node).reflectedClassTemplate = template;
}

/** wabt.js, if available. */
export import wabt = wabt;

/** Options for {@link wasmToWast}. */
export interface WasmToWastOptions {
  readDebugNames?: boolean;
  foldExprs?: boolean;
  inlineExport?: boolean;
  generateNames?: boolean;
}

/** Converts a WebAssembly binary to text format using linear syntax. Requires wabt.js to be present. */
export function wasmToWast(buffer: Uint8Array, options?: WasmToWastOptions): string {
  if (!wabt)
    throw Error("wabt.js not found");

  if (!options) options = {};
  const module = wabt.readWasm(buffer, { readDebugNames: !!options.readDebugNames });
  if (options.generateNames)
    module.generateNames();
  if (options.generateNames || options.readDebugNames)
    module.applyNames();
  const wast = module.toText({ foldExprs: !!options.foldExprs, inlineExport: !!options.inlineExport });
  module.destroy();
  return wast;
}

/** Options for {@link wastToWasm}. */
export interface WastToWasmOptions {
  filename?: string;
  canonicalizeLebs?: boolean;
  relocatable?: boolean;
  writeDebugNames?: boolean;
}

/** Converts WebAssembly text format using linear syntax to a binary. Requires wabt.js to be present. */
export function wastToWasm(text: string, options?: WastToWasmOptions): Uint8Array {
  if (!wabt)
    throw Error("wabt.js not found");

  if (!options) options = {};
  const module = wabt.parseWast(options.filename || "module.wast", text);
  const wasm = module.toBinary({ canonicalize_lebs: !!options.canonicalizeLebs, relocatable: !!options.relocatable, write_debug_names: !!options.writeDebugNames }).buffer;
  module.destroy();
  return wasm;
}

/** Tests if a string starts with the specified. */
export function startsWith(str: string, sub: string): boolean {
  return str.substring(0, sub.length) === sub;
}

/** Writes an 8-bit integer value to a buffer at the specified offset. */
export function writeByte(buffer: Uint8Array, offset: number, value: number): number {
  buffer[offset] = value;
  return 1;
}

/** Writes a 1-bit integer value to a buffer at the specified offset. */
export function writeBool(buffer: Uint8Array, offset: number, value: any): number {
  buffer[offset] = value ? 1 : 0;
  return 1;
}

/** Writes a 16-bit integer value to a buffer at the specified offset. */
export function writeShort(buffer: Uint8Array, offset: number, value: number): number {
  buffer[offset    ] =  value       & 0xff;
  buffer[offset + 1] = (value >> 8) & 0xff;
  return 2;
}

/** Writes a 32-bit integer value to a buffer at the specified offset. */
export function writeInt(buffer: Uint8Array, offset: number, value: number): number {
  buffer[offset    ] =  value         & 0xff;
  buffer[offset + 1] = (value >>>  8) & 0xff;
  buffer[offset + 2] = (value >>> 16) & 0xff;
  buffer[offset + 3] =  value >>> 24;
  return 4;
}

/** Writes a 64-bit integer value to a buffer at the specified offset. */
export function writeLong(buffer: Uint8Array, offset: number, value: Long): number {
  writeInt(buffer, offset    , value.low);
  writeInt(buffer, offset + 4, value.high);
  return 8;
}

// float helpers
const f64 = new Float64Array([ -0 ]);
const f32 = new Float32Array(f64.buffer);
const f8b = new Uint8Array(f64.buffer);
const fle = f8b[7] === 128;

/** Writes a 32-bit float value to a buffer at the specified offset. */
export function writeFloat(buffer: Uint8Array, offset: number, value: number): number {
  f32[0] = value;
  if (fle) {
    buffer[offset    ] = f8b[0];
    buffer[offset + 1] = f8b[1];
    buffer[offset + 2] = f8b[2];
    buffer[offset + 3] = f8b[3];
  } else {
    buffer[offset    ] = f8b[3];
    buffer[offset + 1] = f8b[2];
    buffer[offset + 2] = f8b[1];
    buffer[offset + 3] = f8b[0];
  }
  return 4;
}

/** Writes a 64-bit float value to a buffer at the specified offset. */
export function writeDouble(buffer: Uint8Array, offset: number, value: number): number {
  f64[0] = value;
  if (fle) {
    buffer[offset    ] = f8b[0];
    buffer[offset + 1] = f8b[1];
    buffer[offset + 2] = f8b[2];
    buffer[offset + 3] = f8b[3];
    buffer[offset + 4] = f8b[4];
    buffer[offset + 5] = f8b[5];
    buffer[offset + 6] = f8b[6];
    buffer[offset + 7] = f8b[7];
  } else {
    buffer[offset    ] = f8b[7];
    buffer[offset + 1] = f8b[6];
    buffer[offset + 2] = f8b[5];
    buffer[offset + 3] = f8b[4];
    buffer[offset + 4] = f8b[3];
    buffer[offset + 5] = f8b[2];
    buffer[offset + 6] = f8b[1];
    buffer[offset + 7] = f8b[0];
  }
  return 8;
}
