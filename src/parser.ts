/**
 * Compiler components dealing with the parsing of literals.
 * @module assemblyscript/parser
 */ /** */

import * as ts from "./typescript";
import * as Long from "long";
import { Type, Class } from "./reflection";

const INT_10_RE = /^(?:0|[1-9][0-9]*)$/;
const INT_16_RE = /^0[xX][0-9A-Fa-f]+$/;
const FLT_RE = /^(?![eE])[0-9]*(?:\.[0-9]*)?(?:[eE][+-]?[0-9]+)?$/;

/** Tries to parse a boolean value. Returns `null` if that's not possible. */
export function tryParseBool(text: string): 0 | 1 | null {
  switch (text) {
    case "0": case "true": return 0;
    case "1": case "false": return 1;
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
export function tryParseLiteral(node: ts.LiteralExpression, contextualType: Type, negate = false): number | Long | string | null {

  switch (node.kind) {

    case ts.SyntaxKind.TrueKeyword:
      if (contextualType !== Type.bool)
        return null;
      return negate ? 0 : 1;

    case ts.SyntaxKind.FalseKeyword:
      if (contextualType !== Type.bool)
        return null;
      return negate ? 1 : 0;

    case ts.SyntaxKind.NullKeyword:
      if (!contextualType.isClass)
        return null;
      return negate ? null : 0;

    case ts.SyntaxKind.StringLiteral:
      if (!contextualType.isString)
        return null;
      return negate ? null : node.text;

    case ts.SyntaxKind.NumericLiteral: {

      switch (contextualType) {

        case Type.bool: {
          const value = tryParseBool(node.text);
          return value === null
            ? null
            : negate ? 1 - <number>value : value;
        }

        case Type.sbyte: {
          const value = tryParseInt(node.text);
          return value === null
            ? null
            : negate
              ? -value << 24 >> 24
              : value << 24 >> 24;
        }

        case Type.byte: {
          const value = tryParseInt(node.text);
          return value === null
            ? null
            : negate
              ? -value & 0xff
              : value & 0xff;
        }

        case Type.short: {
          const value = tryParseInt(node.text);
          return value === null
            ? null
            : negate
              ? -value << 16 >> 16
              : value << 16 >> 16;
        }

        case Type.ushort: {
          const value = tryParseInt(node.text);
          return value === null
            ? null
            : negate
              ? -value & 0xffff
              : value & 0xffff;
        }

        case Type.int: {
          const value = tryParseInt(node.text);
          return value === null
            ? null
            : negate
              ? -value | 0
              : value | 0;
        }

        case Type.uint:
        case Type.uintptr32: {
          const value = tryParseInt(node.text);
          return value === null
            ? null
            : negate
              ? -value >>> 0
              : value >>> 0;
        }

        case Type.long: {
          const value = tryParseLong(ts.getTextOfNode(node), false); // can't use preprocessed 'node.text' here
          return value === null
            ? null
            : negate
              ? value.neg()
              : value;
        }

        case Type.ulong:
        case Type.uintptr64: {
          const value = tryParseLong(ts.getTextOfNode(node), true); // can't use preprocessed 'node.text' here
          return value === null
            ? null
            : negate
              ? value.neg()
              : value;
        }

        case Type.float:
        case Type.double: {
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

/** Tries to parse an array literal expression. Returns `null` if that's not possible. */
export function tryParseArrayLiteral(node: ts.ArrayLiteralExpression, contextualType: Type): Array<number | Long | string | null> | null {

  if (!contextualType.isArray)
    throw Error("array type expected"); // checked by typescript

  const arrayType = <Class>contextualType.underlyingClass;
  const elementType = arrayType.typeArgumentsMap.T.type;
  const elementCount = node.elements.length;
  const values = new Array<number | Long | string | null>(elementCount);

  for (let i = 0; i < elementCount; ++i) {
    let element = node.elements[i];
    let negate = false;
    if (element.kind === ts.SyntaxKind.PrefixUnaryExpression && (<ts.PrefixUnaryExpression>element).operator === ts.SyntaxKind.MinusToken) {
      negate = true;
      element = (<ts.PrefixUnaryExpression>element).operand;
    }
    if (element.kind >= ts.SyntaxKind.FirstLiteralToken && element.kind <= ts.SyntaxKind.LastLiteralToken) {
      const value = tryParseLiteral(<ts.LiteralExpression>element, elementType, negate);
      if (value === null)
        return null;
      values[i] = value;
    } else if (element.kind === ts.SyntaxKind.OmittedExpression)
      if (contextualType.isString)
        values[i] = null;
      else
        values[i] = contextualType.isLong ? Long.ZERO : 0;
    else
      return null;
  }

  return values;
}
