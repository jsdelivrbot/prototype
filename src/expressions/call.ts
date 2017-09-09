/** @module assemblyscript/expressions */ /** */

import * as ts from "../typescript";
import * as builtins from "../builtins";
import { Expression } from "binaryen";
import { Compiler } from "../compiler";
import { TypeArgumentsMap, Function, FunctionTemplate, Class, ClassTemplate, ReflectionObjectKind } from "../reflection";
import { getReflectedType, setReflectedType } from "../util";

/** Compiles a function call expression. */
export function compileCall(compiler: Compiler, node: ts.CallExpression/*, contextualType: reflection.Type*/): Expression {
  const op = compiler.module;

  // we'll need a reference to the reflected function and, if it is an instance call, evaluate the value of 'this'
  let instance: Function | undefined;
  let template: FunctionTemplate | undefined;
  let thisExpression: Expression | undefined;

  // either static (Classname.methodName) or instance (expression.methodName)
  if (node.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
    const accessNode = <ts.PropertyAccessExpression>node.expression;
    const methodName = ts.getTextOfNode(accessNode.name);

    // check for Classname.methodName
    if (accessNode.expression.kind === ts.SyntaxKind.Identifier) {
      const reference = compiler.resolveReference(<ts.Identifier>accessNode.expression, ReflectionObjectKind.ClassTemplate);
      if (reference instanceof ClassTemplate) {
        const methodDeclaration = reference.methodDeclarations[methodName];
        if (methodDeclaration) {
          const method = compiler.initializeStaticMethod(methodDeclaration);
          instance = method.instance;
          template = method.template;
        } else {
          compiler.report(accessNode.name, ts.DiagnosticsEx.Unresolvable_identifier_0, methodName);
          return op.unreachable();
        }
      } // otherwise try next
    }

    // otherwise expression.methodName
    if (!template) {
      thisExpression = compiler.compileExpression(accessNode.expression, compiler.usizeType);
      const thisType = getReflectedType(accessNode.expression);
      const underlyingClass = thisType.underlyingClass;

      if (!underlyingClass)
        throw Error("expected a class type"); // handled by typescript

      instance = underlyingClass.methods[methodName].instance;
      template = underlyingClass.methods[methodName].template;
    }

  // super call
  } else if (node.expression.kind === ts.SyntaxKind.SuperKeyword) {
    const thisClass = compiler.currentFunction.parent;

    if (!(thisClass && thisClass.base))
      throw Error("missing base class"); // handled by typescript

    let baseClass: Class | undefined = thisClass.base;
    let ctor: Function | undefined;
    while (baseClass) {
      ctor = baseClass.ctor;
      if (ctor && ctor.body)
        break;
      baseClass = baseClass.base;
    }

    if (!(ctor && ctor.body))
      return op.nop(); // no explicit parent constructor

    instance = ctor;
    template = ctor.template;
    thisExpression = op.getLocal(compiler.currentFunction.localsByName.this.localIndex, compiler.typeOf(compiler.usizeType));

  // top-level function call
  } else if (node.expression.kind === ts.SyntaxKind.Identifier) {
    const reference = <Function | FunctionTemplate>compiler.resolveReference(<ts.Identifier>node.expression, ReflectionObjectKind.FunctionTemplate | ReflectionObjectKind.Function);

    if (reference instanceof Function) {
      instance = reference;
      template = reference.template;

    } else if (reference instanceof FunctionTemplate) {
      template = reference;

    } else {
      compiler.report(node.expression, ts.DiagnosticsEx.Unresolvable_identifier_0, ts.getTextOfNode(node.expression));
      return op.unreachable();
    }

  } else {
    compiler.report(node.expression, ts.DiagnosticsEx.Unsupported_node_kind_0_in_1, node.expression.kind, "expressions.compileCall");
    return op.unreachable();
  }

  // at this point, template is known but instance might not
  if (!instance) {
    const typeArgumentsMap: TypeArgumentsMap = {};

    // inherit type arguments from current class and function
    const currentFunction = compiler.currentFunction;
    if (currentFunction) {
      if (currentFunction.parent)
        Object.keys(currentFunction.parent.typeArgumentsMap).forEach(key => typeArgumentsMap[key] = (<Class>currentFunction.parent).typeArgumentsMap[key]);
      Object.keys(currentFunction.typeArgumentsMap).forEach(key => typeArgumentsMap[key] = currentFunction.typeArgumentsMap[key]);
    }

    // but always prefer bound parent arguments, if applicable
    if (template.parent)
      Object.keys(template.parent.typeArgumentsMap).forEach(key => typeArgumentsMap[key] = (<Class>(<FunctionTemplate>template).parent).typeArgumentsMap[key]);

    instance = template.resolve(node.typeArguments || [], typeArgumentsMap); // reports
  }

  setReflectedType(node, instance.returnType);

  // compile built-in call to inline assembly
  if (builtins.isBuiltinFunction(instance.name, true)) {

    const argumentExpressions: Expression[] = new Array(instance.parameters.length);
    for (let i = 0, k = instance.parameters.length; i < k; ++i) {
      const argumentType = instance.parameters[i].type;
      argumentExpressions[i] = compiler.compileExpression(node.arguments[i], argumentType, argumentType, false);
    }

    switch (instance.simpleName) {

      case "rotl":
      case "rotll":
        return builtins.rotl(compiler, [ node.arguments[0], node.arguments[1] ], [ argumentExpressions[0], argumentExpressions[1] ]);

      case "rotr":
      case "rotrl":
        return builtins.rotr(compiler, [ node.arguments[0], node.arguments[1] ], [ argumentExpressions[0], argumentExpressions[1] ]);

      case "clz":
      case "clzl":
        return builtins.clz(compiler, node.arguments[0], argumentExpressions[0]);

      case "ctz":
      case "ctzl":
        return builtins.ctz(compiler, node.arguments[0], argumentExpressions[0]);

      case "popcnt":
      case "popcntl":
        return builtins.popcnt(compiler, node.arguments[0], argumentExpressions[0]);

      case "abs":
      case "absf":
        return builtins.abs(compiler, node.arguments[0], argumentExpressions[0]);

      case "ceil":
      case "ceilf":
        return builtins.ceil(compiler, node.arguments[0], argumentExpressions[0]);

      case "floor":
      case "floorf":
        return builtins.floor(compiler, node.arguments[0], argumentExpressions[0]);

      case "sqrt":
      case "sqrtf":
        return builtins.sqrt(compiler, node.arguments[0], argumentExpressions[0]);

      case "trunc":
      case "truncf":
        return builtins.trunc(compiler, node.arguments[0], argumentExpressions[0]);

      case "nearest":
      case "nearestf":
        return builtins.nearest(compiler, node.arguments[0], argumentExpressions[0]);

      case "min":
      case "minf":
        return builtins.min(compiler, [ node.arguments[0], node.arguments[1] ], [ argumentExpressions[0], argumentExpressions[1] ]);

      case "max":
      case "maxf":
        return builtins.max(compiler, [ node.arguments[0], node.arguments[1] ], [ argumentExpressions[0], argumentExpressions[1] ]);

      case "copysign":
      case "copysignf":
        return builtins.copysign(compiler, [ node.arguments[0], node.arguments[1] ], [ argumentExpressions[0], argumentExpressions[1] ]);

      case "reinterpreti":
      case "reinterpretl":
      case "reinterpretf":
      case "reinterpretd":
        return builtins.reinterpret(compiler, node.arguments[0], argumentExpressions[0]);

      case "current_memory":
        return builtins.current_memory(compiler);

      case "grow_memory":
        return builtins.grow_memory(compiler, node.arguments[0], argumentExpressions[0]);

      case "unreachable":
        return builtins.unreachable(compiler);

      case "sizeof":
        return builtins.sizeof(compiler, instance.typeArgumentsMap.T.type);

      case "load":
        return builtins.load(compiler, instance.typeArgumentsMap.T.type, node.arguments[0], argumentExpressions[0]);

      case "store":
        return builtins.store(compiler, instance.typeArgumentsMap.T.type, [ node.arguments[0], node.arguments[1] ], [ argumentExpressions[0], argumentExpressions[1] ]);

      case "unsafe_cast":
        return builtins.unsafe_cast(argumentExpressions[0]);

      case "isNaN":
      case "isNaNf":
        return builtins.isNaN(compiler, node.arguments[0], argumentExpressions[0]);

      case "isFinite":
      case "isFinitef":
        return builtins.isFinite(compiler, node.arguments[0], argumentExpressions[0]);
    }
  }

  // otherwise call the actual function (compiles it if necessary)
  return instance.compileCall(node.arguments, thisExpression);
}

export default compileCall;
