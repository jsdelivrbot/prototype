/**
 * Compiler components dealing with TypeScript statements.
 * @module assemblyscript/statements
 */ /** */

import { Statement, Expression, I32Expression } from "binaryen";
import { tryParseLiteral } from "./parser";
import Compiler from "./compiler";
import { Type } from "./reflection";
import * as ts from "./typescript";
import { getReflectedType, isConst } from "./util";

/** Compiles any supported statement. */
export function compile(compiler: Compiler, node: ts.Statement): Statement | null {
  const op = compiler.module;

  switch (node.kind) {

    case ts.SyntaxKind.EmptyStatement:
    case ts.SyntaxKind.TypeAliasDeclaration: // handled by TypeScript
      return null;

    case ts.SyntaxKind.VariableStatement:
      return compileVariable(compiler, <ts.VariableStatement>node);

    case ts.SyntaxKind.IfStatement:
      return compileIf(compiler, <ts.IfStatement>node);

    case ts.SyntaxKind.SwitchStatement:
      return compileSwitch(compiler, <ts.SwitchStatement>node);

    case ts.SyntaxKind.WhileStatement:
      return compileWhile(compiler, <ts.WhileStatement>node);

    case ts.SyntaxKind.DoStatement:
      return compileDo(compiler, <ts.DoStatement>node);

    case ts.SyntaxKind.ForStatement:
      return compileFor(compiler, <ts.ForStatement>node);

    case ts.SyntaxKind.Block:
      return compileBlock(compiler, <ts.Block>node);

    case ts.SyntaxKind.BreakStatement:
    case ts.SyntaxKind.ContinueStatement:
      return compileBreak(compiler, <ts.BreakStatement | ts.ContinueStatement>node);

    case ts.SyntaxKind.ExpressionStatement:
      return compileExpression(compiler, <ts.ExpressionStatement>node);

    case ts.SyntaxKind.ReturnStatement:
      return compileReturn(compiler, <ts.ReturnStatement>node);

    case ts.SyntaxKind.ThrowStatement:
      return compileThrow(compiler/*, <typescript.ThrowStatement>node*/);
  }

  compiler.report(node, ts.DiagnosticsEx.Unsupported_node_kind_0_in_1, node.kind, "statements.compile");
  return op.unreachable();
}

/** Compiles a block statement. */
export function compileBlock(compiler: Compiler, node: ts.Block): Statement | null {
  const op = compiler.module;
  const count = node.statements.length;

  if (count < 1) return null;

  const body: Statement[] = new Array(count);
  let   bodyLength = 0;

  for (let i = 0; i < count; ++i) {
    const stmt = compile(compiler, node.statements[i]);
    if (stmt)
      body[bodyLength++] = stmt;
  }

  if (bodyLength === 0) return null;
  if (bodyLength === 1) return body[0];

  body.length = bodyLength;
  return op.block("", body);
}

/** Compiles a break statement. */
export function compileBreak(compiler: Compiler, node: ts.BreakStatement | ts.ContinueStatement): Statement {
  const op = compiler.module;

  return op.break(
    (node.kind === ts.SyntaxKind.ContinueStatement
      ? "continue$"
      : "break$"
    ) + compiler.currentBreakLabel
  );
}

/** Compiles a do loop statement. */
export function compileDo(compiler: Compiler, node: ts.DoStatement): Statement {
  const op = compiler.module;

  const label = compiler.enterBreakContext();
  const loop: Statement[] = new Array(2);
  let   loopLength = 0;

  if (node.statement) {
    const compiled: Statement | null = compile(compiler, node.statement);
    if (compiled)
      loop[loopLength++] = compiled;
  }

  loop[loopLength++] = op.break("continue$" + label,
    compiler.compileExpression(node.expression, Type.int, Type.int, false)
  );

  loop.length = loopLength;
  compiler.leaveBreakContext();
  return op.block("break$" + label, [
    op.loop("continue$" + label,
      op.block("", loop)
    )
  ]);
}

/** Compiles an expression statement. */
export function compileExpression(compiler: Compiler, node: ts.ExpressionStatement): Statement {
  const op = compiler.module;

  const expressionNode = node.expression;
  const expression = compiler.compileExpression(expressionNode, Type.void);

  return getReflectedType(expressionNode) === Type.void
    ? expression
    : op.drop(expression);
}

/** Compiles a for loop statement. */
export function compileFor(compiler: Compiler, node: ts.ForStatement): Statement {
  const op = compiler.module;

  const label = compiler.enterBreakContext();
  const context: Statement[] = [];
  const ifTrue: Statement[] = [];

  if (node.initializer) {
    if (node.initializer.kind === ts.SyntaxKind.VariableDeclarationList) {
      const compiled: Statement | null = compileVariableDeclarationList(compiler, <ts.VariableDeclarationList>node.initializer);
      if (compiled)
        context.push(compiled);

    } else /* typescript.Expression */ {

      const expr = compiler.compileExpression(<ts.Expression>node.initializer, Type.void);
      if (getReflectedType(node.initializer) === Type.void)
        context.push(expr);
      else
        context.push(op.drop(expr));
    }
  }

  if (node.statement) {
    const compiled: Statement | null = compile(compiler, node.statement);
    if (compiled)
      ifTrue.push(compiled);
  }

  if (node.incrementor) {
    const expr = compiler.compileExpression(node.incrementor, Type.void);
    if (getReflectedType(node.incrementor) === Type.void)
      ifTrue.push(expr);
    else
      ifTrue.push(op.drop(expr));
  }

  ifTrue.push(op.break("continue$" + label));

  if (node.condition) {

    context.push(
      op.loop("continue$" + label,
        op.if(
          compiler.compileExpression(node.condition, Type.int, Type.int, false),
          ifTrue.length === 1 ? ifTrue[0] : op.block("", ifTrue)
        )
      )
    );

  } else {

    if (ifTrue.length === 1)
      compiler.report(node, ts.DiagnosticsEx.Unconditional_endless_loop_detected); // this is an error because binaryen throws here

    context.push(
      op.loop("continue$" + label,
        ifTrue.length === 1 ? ifTrue[0] : op.block("", ifTrue)
      )
    );

  }

  compiler.leaveBreakContext();
  return op.block("break$" + label, context);
}

/** Compiles an if statement. */
export function compileIf(compiler: Compiler, node: ts.IfStatement): Statement {
  const op = compiler.module;
  return op.if(
    compiler.compileExpression(node.expression, Type.int, Type.int, true),
    compile(compiler, node.thenStatement) || op.nop(),
    node.elseStatement && compile(compiler, node.elseStatement) || undefined
  );
}

/** Compiles a return statement. */
export function compileReturn(compiler: Compiler, node: ts.ReturnStatement): Statement {
  const op = compiler.module;
  const returnType = compiler.currentFunction.returnType;

  if (returnType === Type.void) {
    if (node.expression)
      compiler.report(node, ts.DiagnosticsEx.Function_without_a_return_type_cannot_return_a_value);
    return op.return();
  }

  if (node.expression)
    return op.return(
      compiler.compileExpression(<ts.Expression>node.expression, returnType, returnType, false)
    );

  compiler.report(node, ts.DiagnosticsEx.Function_with_a_return_type_must_return_a_value);
  return op.unreachable();
}

/** Compiles a switch statement. */
export function compileSwitch(compiler: Compiler, node: ts.SwitchStatement): Statement {
  const op = compiler.module;

  if (node.caseBlock.clauses && node.caseBlock.clauses.length) {
    const switchExpression = compiler.compileExpression(node.expression, Type.int, Type.int, true);
    const label = compiler.enterBreakContext();

    // create a temporary variable holding the switch expression's result
    const conditionLocal = compiler.currentFunction.addLocal("condition$" + label, Type.int);

    interface SwitchCase {
      label: string;
      index: number;
      statements: Statement[];
      expression?: I32Expression;
    }

    const cases: SwitchCase[] = new Array(node.caseBlock.clauses.length);
    let defaultCase: SwitchCase | null = null;
    const labels: string[] = [];

    // scan through cases and also determine default case
    for (let i = 0, k = node.caseBlock.clauses.length; i < k; ++i) {
      const clause = node.caseBlock.clauses[i];
      const statements: Statement[] = new Array(clause.statements.length);
      let index = 0;
      for (let j = 0, l = clause.statements.length; j < l; ++j) {
        const compiled: Statement | null = compile(compiler, clause.statements[j]);
        if (compiled)
          statements[index++] = compiled;
      }
      statements.length = index;
      if (clause.kind === ts.SyntaxKind.DefaultClause) {
        defaultCase = cases[i] = {
          label: "default$" + label,
          index: i,
          statements: statements
        };
      } else /* typescript.CaseClause */ {
        cases[i] = {
          label:  "case" + i + "$" + label,
          index: i,
          statements: statements,
          expression: compiler.maybeConvertValue(clause.expression, compiler.compileExpression(clause.expression, Type.int), getReflectedType(clause.expression), Type.int, true)
        };
        labels.push(cases[i].label);
      }
    }

    // build the condition as a nested select, starting at its tail
    // TODO: doesn't have to use select for sequential expressions (-O doesn't catch this)
    let condition = op.i32.const(-1);
    for (let i = cases.length - 1; i >= 0; --i)
      if (cases[i] !== defaultCase)
        condition = op.select(op.i32.eq(op.getLocal(conditionLocal.localIndex, compiler.typeOf(Type.int)), <I32Expression>cases[i].expression), op.i32.const(i), condition);

    // create the innermost br_table block using the first case's label
    let currentBlock = op.block(cases[0].label, [
      op.setLocal(conditionLocal.localIndex, switchExpression),
      op.switch(labels, defaultCase ? defaultCase.label : "break$" + label, condition)
    ]);

    // keep wrapping the last case's block within the current case's block using the next case's label
    for (let i = 0, k = cases.length; i < k; ++i) {
      if (i + 1 < k)
        currentBlock = op.block(cases[i + 1].label, [ currentBlock ].concat(cases[i].statements));
      else // last block is the common outer 'break' target (-O unwraps this if there's no 'break')
        currentBlock = op.block("break$" + label, [ currentBlock ].concat(cases[i].statements));
    }

    compiler.leaveBreakContext();
    return currentBlock;

  } else { // just emit the condition for the case that it includes compound assignments (-O eliminates this otherwise)

    const voidCondition = compiler.compileExpression(node.expression, Type.void);
    if (getReflectedType(node.expression) === Type.void)
      return voidCondition;
    else
      return op.drop(voidCondition);
  }
}

/** Compiles a throw statement. */
export function compileThrow(compiler: Compiler/*, node: typescript.ThrowStatement*/): Statement {
  return compiler.module.unreachable(); // see: https://github.com/AssemblyScript/assemblyscript/issues/103
}

/** Compiles a variable declaration statement. */
export function compileVariable(compiler: Compiler, node: ts.VariableStatement): Statement | null {
  return compileVariableDeclarationList(compiler, node.declarationList);
}

/** Compiles a variable declaration list statement. */
function compileVariableDeclarationList(compiler: Compiler, node: ts.VariableDeclarationList): Statement | null {
  const op = compiler.module;

  const initializers: Expression[] = [];
  let lastType: Type | undefined;
  const mutable = !isConst(node);
  for (let i = 0, k = node.declarations.length; i < k; ++i) {
    const declaration = node.declarations[i];
    const declarationName = ts.getTextOfNode(declaration.name);
    let declarationType: Type;
    if (declaration.type) {
      const declarationTypeName = ts.getTextOfNode(declaration.type);
      lastType = declarationType = compiler.currentFunction && compiler.currentFunction.typeArgumentsMap[declarationTypeName] && compiler.currentFunction.typeArgumentsMap[declarationTypeName].type || compiler.resolveType(declaration.type);
      if (!declarationType)
        declarationType = Type.void;
    } else if (lastType) {
      compiler.report(declaration.name, ts.DiagnosticsEx.Assuming_variable_type_0, lastType.toString());
      declarationType = lastType;
    } else {
      compiler.report(declaration.name, ts.DiagnosticsEx.Type_expected);
      continue;
    }
    if (!mutable && declarationType.isNumeric) { // try to inline
      if (declaration.initializer) {
        let initializer = declaration.initializer;
        let negate = false;
        if (initializer.kind === ts.SyntaxKind.PrefixUnaryExpression && (<ts.PrefixUnaryExpression>initializer).operator === ts.SyntaxKind.MinusToken) {
          negate = true;
          initializer = (<ts.PrefixUnaryExpression>initializer).operand;
        }
        if (initializer.kind === ts.SyntaxKind.NumericLiteral) {
          const parsed = tryParseLiteral(<ts.LiteralExpression>initializer, declarationType, negate);
          if (parsed !== null) {
            compiler.currentFunction.addLocal(declarationName, declarationType, false, <number | Long>parsed);
            continue;
          }
        }
      } else {
        compiler.currentFunction.addLocal(declarationName, declarationType, false, 0);
        continue;
      }
    }
    const local = compiler.currentFunction.addLocal(declarationName, declarationType, mutable);
    if (declaration.initializer)
      initializers.push(op.setLocal(local.localIndex, compiler.compileExpression(declaration.initializer, declarationType, declarationType, false)));
  }

  return initializers.length === 0 ? null
       : initializers.length === 1 ? initializers[0]
       : op.block("", initializers); // binaryen -O unwraps this
}

/** Compiles a while loop statement. */
export function compileWhile(compiler: Compiler, node: ts.WhileStatement): Statement {
  const op = compiler.module;

  const ifTrue: Statement[] = new Array(2);
  const label = compiler.enterBreakContext();
  let index = 0;

  if (node.statement) {
    const compiled: Statement | null = compile(compiler, node.statement);
    if (compiled)
      ifTrue[index++] = compiled;
  }

  ifTrue[index++] = op.break("continue$" + label);
  ifTrue.length = index;

  compiler.leaveBreakContext();
  return op.block("break$" + label, [
    op.loop("continue$" + label,
      op.if(
        compiler.compileExpression(node.expression, Type.int, Type.int, true),
        ifTrue.length === 1 ? ifTrue[0] : op.block("", ifTrue)
      )
    )
  ]);
}
