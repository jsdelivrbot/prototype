/** @module assemblyscript/expressions */ /** */

import * as binaryen from "binaryen";
import Compiler from "../compiler";
import * as Long from "long";
import * as reflection from "../reflection";
import * as typescript from "../typescript";
import * as util from "../util";

/** Compiles a literal expression. */
export function compileLiteral(compiler: Compiler, node: typescript.LiteralExpression, contextualType: reflection.Type, negate: boolean = false): binaryen.Expression {
  const op = compiler.module;

  util.setReflectedType(node, contextualType);

  switch (node.kind) {
    case typescript.SyntaxKind.TrueKeyword:
      negate = !negate;

    case typescript.SyntaxKind.FalseKeyword:
      util.setReflectedType(node, reflection.boolType);
      return negate
        ? contextualType.isLong ? op.i64.const(1, 0) : op.i32.const(1)
        : contextualType.isLong ? op.i64.const(0, 0) : op.i32.const(0);

    case typescript.SyntaxKind.NullKeyword:
      util.setReflectedType(node, compiler.uintptrType);
      return compiler.uintptrSize === 4 ? op.i32.const(0) : op.i64.const(0, 0);

    case typescript.SyntaxKind.NumericLiteral:
    {
      const parsed = tryParseLiteral(node, contextualType, negate);
      if (parsed === null) {
        compiler.report(node, typescript.DiagnosticsEx.Unsupported_literal_0, typescript.getTextOfNode(node));
        return op.unreachable();
      }
      switch (contextualType) {

        case reflection.floatType:
          return op.f32.const(<number>parsed);

        case reflection.doubleType:
          return op.f64.const(<number>parsed);

        case reflection.longType:
        case reflection.ulongType:
        case reflection.uintptrType64:
          return op.i64.const((<Long>parsed).low, (<Long>parsed).high);

      }
      return op.i32.const(<number>parsed);
    }

    case typescript.SyntaxKind.StringLiteral:
    {
      const text = node.text;
      const offset = compiler.memory.createString(text, true).offset;
      return compiler.valueOf(compiler.uintptrType, offset);
    }
  }

  compiler.report(node, typescript.DiagnosticsEx.Unsupported_literal_0, typescript.getTextOfNode(node));
  return op.unreachable();
}

export { compileLiteral as default };

const INT_10_RE = /^(?:0|[1-9][0-9]*)$/;
const INT_16_RE = /^0[xX][0-9A-Fa-f]+$/;
const FLT_RE = /^(?![eE])[0-9]*(?:\.[0-9]*)?(?:[eE][+-]?[0-9]+)?$/;

/** Tries to parse a boolean value. Returns `null` if that's not possible. */
export function tryParseBool(text: string): 0 | 1 | null {
  switch (text) {
    case "0": return 0;
    case "1": return 1;
  }
  return null;
}

/** Tries to parse an integer value. Returns `null` if that's not possible. */
export function tryParseInt(text: string): number | null {
  if (INT_10_RE.test(text))
    return parseInt(text, 10);
  if (INT_16_RE.test(text))
    return parseInt(text.substring(2), 16);
  return null;
}

/** Tries to parse a long value. Returns `null` if that's not possible. */
export function tryParseLong(text: string, unsigned = false): Long | null {
  if (INT_10_RE.test(text))
    return Long.fromString(text, unsigned, 10);
  if (INT_16_RE.test(text))
    return Long.fromString(text.substring(2), unsigned, 16);
  return null;
}

/** Tries to parse a float value. Returns `null` if that's not possible. */
export function tryParseFloat(text: string): number | null {
  if (FLT_RE.test(text))
    return parseFloat(text);
  return null;
}

/** Tries to parse a literal expression. Returns `null` if that's not possible. */
export function tryParseLiteral(node: typescript.LiteralExpression, contextualType: reflection.Type, negate = false): number | Long | string | null {

  switch (node.kind) {

    case typescript.SyntaxKind.TrueKeyword:
      if (contextualType !== reflection.boolType)
        return null;
      return negate ? 0 : 1;

    case typescript.SyntaxKind.FalseKeyword:
      if (contextualType !== reflection.boolType)
        return null;
      return negate ? 1 : 0;

    case typescript.SyntaxKind.NullKeyword:
      if (!contextualType.isClass)
        return null;
      return negate ? null : 0;

    case typescript.SyntaxKind.StringLiteral:
      if (!contextualType.isString)
        return null;
      return negate ? null : node.text;

    case typescript.SyntaxKind.NumericLiteral: {

      switch (contextualType) {

        case reflection.boolType: {
          const value = tryParseBool(node.text);
          return value === null
            ? null
            : negate ? 1 - <number>value : value;
        }

        case reflection.sbyteType: {
          const value = tryParseInt(node.text);
          return value === null
            ? null
            : negate
              ? -value << 24 >> 24
              : value << 24 >> 24;
        }

        case reflection.byteType: {
          const value = tryParseInt(node.text);
          return value === null
            ? null
            : negate
              ? -value & 0xff
              : value & 0xff;
        }

        case reflection.shortType: {
          const value = tryParseInt(node.text);
          return value === null
            ? null
            : negate
              ? -value << 16 >> 16
              : value << 16 >> 16;
        }

        case reflection.ushortType: {
          const value = tryParseInt(node.text);
          return value === null
            ? null
            : negate
              ? -value & 0xffff
              : value & 0xffff;
        }

        case reflection.intType: {
          const value = tryParseInt(node.text);
          return value === null
            ? null
            : negate
              ? -value | 0
              : value | 0;
        }

        case reflection.uintType:
        case reflection.uintptrType32: {
          const value = tryParseInt(node.text);
          return value === null
            ? null
            : negate
              ? -value >>> 0
              : value >>> 0;
        }

        case reflection.longType: {
          const value = tryParseLong(typescript.getTextOfNode(node), false); // can't use preprocessed 'node.text' here
          return value === null
            ? null
            : negate
              ? value.neg()
              : value;
        }

        case reflection.ulongType:
        case reflection.uintptrType64: {
          const value = tryParseLong(typescript.getTextOfNode(node), true); // can't use preprocessed 'node.text' here
          return value === null
            ? null
            : negate
              ? value.neg()
              : value;
        }

        case reflection.floatType:
        case reflection.doubleType: {
          const value = tryParseFloat(node.text);
          return value === null
            ? null
            : negate
              ? -value
              : value;
        }
      }
    }
  }
  return null;
}
