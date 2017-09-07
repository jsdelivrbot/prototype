/** @module assemblyscript/expressions */ /** */

import * as ts from "../typescript";
import { Expression } from "binaryen";
import { Compiler } from "../compiler";
import { Type } from "../reflection";
import { setReflectedType } from "../util";

/** Compiles an omitted expression. */
export function compileOmitted(compiler: Compiler, node: ts.OmittedExpression, contextualType: Type): Expression {
  const op = compiler.module;
  const parent = <ts.Node>node.parent;

  setReflectedType(node, contextualType);

  // omitted expression in array literal
  if (parent.kind === ts.SyntaxKind.ArrayLiteralExpression)
    return compiler.valueOf(contextualType, 0);

  compiler.report(node, ts.DiagnosticsEx.Unsupported_node_kind_0_in_1, parent.kind, "expressions/compileOmitted");
  return op.unreachable();
}

export default compileOmitted;
