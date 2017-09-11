/**
 * Compiler components dealing with TypeScript expressions.
 * @module assemblyscript/expressions
 * @preferred
 */ /** */

// TODO: refactor this

export * from "./expressions/arrayliteral";
export * from "./expressions/as";
export * from "./expressions/binary";
export * from "./expressions/call";
export * from "./expressions/conditional";
export * from "./expressions/elementaccess";
export * from "./expressions/helpers/load";
export * from "./expressions/helpers/loadorstore";
export * from "./expressions/helpers/store";
export * from "./expressions/identifier";
export * from "./expressions/literal";
export * from "./expressions/new";
export * from "./expressions/omitted";
export * from "./expressions/parenthesized";
export * from "./expressions/postfixunary";
export * from "./expressions/prefixunary";
export * from "./expressions/propertyaccess";

import * as binaryen from "binaryen";
import Compiler from "./compiler";
import { tryParseLiteral, tryParseArrayLiteral } from "./parser";
import * as reflection from "./reflection";
import * as ts from "./typescript";
import * as util from "./util";
import {
  compileArrayLiteral,
  compileAs,
  compileBinary,
  compileCall,
  compileConditional,
  compileElementAccess,
  compileIdentifier,
  compileLiteral,
  compileNew,
  compileParenthesized,
  compilePostfixUnary,
  compilePrefixUnary,
  compilePropertyAccess,
  compileOmitted
} from "./expressions";

/** Compiles any supported expression. */
export function compile(compiler: Compiler, node: ts.Expression, contextualType: reflection.Type): binaryen.Expression {
  const op = compiler.module;

  util.setReflectedType(node, contextualType);

  switch (node.kind) {

    case ts.SyntaxKind.ParenthesizedExpression:
      return compileParenthesized(compiler, <ts.ParenthesizedExpression>node, contextualType);

    case ts.SyntaxKind.AsExpression:
    case ts.SyntaxKind.TypeAssertionExpression:
      return compileAs(compiler, <ts.AssertionExpression>node, contextualType);

    case ts.SyntaxKind.BinaryExpression:
      return compileBinary(compiler, <ts.BinaryExpression>node, contextualType);

    case ts.SyntaxKind.PrefixUnaryExpression:
      return compilePrefixUnary(compiler, <ts.PrefixUnaryExpression>node, contextualType);

    case ts.SyntaxKind.PostfixUnaryExpression:
      return compilePostfixUnary(compiler, <ts.PostfixUnaryExpression>node, contextualType);

    case ts.SyntaxKind.Identifier:
      return compileIdentifier(compiler, <ts.Identifier>node, contextualType);

    case ts.SyntaxKind.PropertyAccessExpression:
      return compilePropertyAccess(compiler, <ts.PropertyAccessExpression>node, contextualType);

    case ts.SyntaxKind.ElementAccessExpression:
      return compileElementAccess(compiler, <ts.ElementAccessExpression>node, contextualType);

    case ts.SyntaxKind.ConditionalExpression:
      return compileConditional(compiler, <ts.ConditionalExpression>node, contextualType);

    case ts.SyntaxKind.CallExpression:
      return compileCall(compiler, <ts.CallExpression>node/*, contextualType*/);

    case ts.SyntaxKind.NewExpression:
      return compileNew(compiler, <ts.NewExpression>node, contextualType);

    case ts.SyntaxKind.ThisKeyword:
      if (compiler.currentFunction.isInstance && compiler.currentFunction.parent)
        util.setReflectedType(node, compiler.currentFunction.parent.type);
      else
        compiler.report(node, ts.DiagnosticsEx.Identifier_0_is_invalid_in_this_context, "this");
      return op.getLocal(0, compiler.typeOf(compiler.usizeType));

    case ts.SyntaxKind.TrueKeyword:
    case ts.SyntaxKind.FalseKeyword:
    case ts.SyntaxKind.NullKeyword:
    case ts.SyntaxKind.StringLiteral:
      return compileLiteral(compiler, <ts.LiteralExpression>node, contextualType);

    case ts.SyntaxKind.NumericLiteral:
      const parent = <ts.Node>node.parent;
      return compileLiteral(compiler, <ts.LiteralExpression>node, contextualType, parent.kind === ts.SyntaxKind.PrefixUnaryExpression && (<ts.PrefixUnaryExpression>parent).operator === ts.SyntaxKind.MinusToken);

    case ts.SyntaxKind.ArrayLiteralExpression:
      return compileArrayLiteral(compiler, <ts.ArrayLiteralExpression>node, contextualType);

    case ts.SyntaxKind.OmittedExpression:
      return compileOmitted(compiler, <ts.OmittedExpression>node, contextualType);
  }

  compiler.report(node, ts.DiagnosticsEx.Unsupported_node_kind_0_in_1, node.kind, "expressions.compile");
  util.setReflectedType(node, contextualType);
  return op.unreachable();
}

/** Evaluates any supported expression. Returns `null` if that's not possible. */
export function tryEvaluate(node: ts.Expression, contextualType: reflection.Type): number | Long | string | Array<number | Long | string | null> | null {

  // TODO: See https://github.com/AssemblyScript/assemblyscript/issues/100

  // A code search for "=== typescript.SyntaxKind.PrefixUnaryExpression" should yield any locations
  // where support for negation has been hard coded instead.

  switch (node.kind) {

    case ts.SyntaxKind.ParenthesizedExpression:
      return tryEvaluate((<ts.ParenthesizedExpression>node).expression, contextualType);

    case ts.SyntaxKind.PrefixUnaryExpression: {
      const expr = <ts.PrefixUnaryExpression>node;
      if (expr.operator === ts.SyntaxKind.MinusToken && expr.operand.kind === ts.SyntaxKind.NumericLiteral)
        return tryParseLiteral(<ts.NumericLiteral>expr.operand, contextualType, true);
      return null;
    }

    case ts.SyntaxKind.TrueKeyword:
    case ts.SyntaxKind.FalseKeyword:
    case ts.SyntaxKind.NullKeyword:
    case ts.SyntaxKind.NumericLiteral:
    case ts.SyntaxKind.StringLiteral:
      return tryParseLiteral(<ts.LiteralExpression>node, contextualType);

    case ts.SyntaxKind.ArrayLiteralExpression:
      if (!contextualType.isArray)
        return null;
      return tryParseArrayLiteral(<ts.ArrayLiteralExpression>node, contextualType);

  }
  return null;
}
