/** @module assemblyscript/expressions */ /** */

import * as ts from "../typescript";
import { Expression } from "binaryen";
import { Compiler } from "../compiler";
import { Type, Function, Class, ClassTemplate, ReflectionObjectKind } from "../reflection";
import { setReflectedType } from "../util";

/** Compiles a 'new' expression. */
export function compileNew(compiler: Compiler, node: ts.NewExpression, contextualType: Type): Expression {
  const op = compiler.module;

  setReflectedType(node, contextualType);

  if (node.expression.kind !== ts.SyntaxKind.Identifier) {
    compiler.report(node.expression, ts.DiagnosticsEx.Unsupported_node_kind_0_in_1, node.expression.kind, "expressions.compileNew");
    return op.unreachable();
  }

  const identifierNode = <ts.Identifier>node.expression;
  if (contextualType !== Type.void && !contextualType.underlyingClass)
    throw Error("new used in non-class context"); // handled by typescript

  const reference = compiler.resolveReference(identifierNode, ReflectionObjectKind.ClassTemplate | ReflectionObjectKind.Class);
  let instance: Class;

  if (reference instanceof ClassTemplate) {
    const template = <ClassTemplate>reference;
    let typeArguments: ts.NodeArray<ts.TypeNode> | ts.TypeNode[] | undefined = node.typeArguments;
    if (!typeArguments && contextualType.underlyingClass) { // inherit from contextual class
      const clazz = contextualType.underlyingClass;
      typeArguments = Object.keys(clazz.typeArgumentsMap).map(key => clazz.typeArgumentsMap[key].node);
    }
    instance = template.resolve(typeArguments || []);

  } else if (reference instanceof Class) {
    instance = <Class>reference;

  } else {
    compiler.report(identifierNode, ts.DiagnosticsEx.Unresolvable_identifier_0, ts.getTextOfNode(identifierNode));
    return op.unreachable();
  }

  if (contextualType.underlyingClass && !instance.isAssignableTo(contextualType.underlyingClass))
    compiler.report(node.expression, ts.DiagnosticsEx.Types_0_and_1_are_incompatible, instance.type.toString(), contextualType.underlyingClass.toString());

  // Find the first implemented constructor
  let current: Class = instance;
  let ctor: Function | undefined = instance.ctor;
  while (!(ctor && ctor.body) && current.base) {
    current = current.base;
    ctor = current.ctor;
  }

  const allocate = instance.implicitMalloc
    ? compiler.compileMallocInvocation(instance.size) // implicit allocation
    : compiler.valueOf(compiler.usizeType, 0);  // allocates on its own (this=null)

  // If there is no constructor defined, just allocate memory
  if (!(ctor && ctor.body))
    return allocate;

  // And call it (inserts 'this')
  return ctor.compileCall(node.arguments || [], allocate);
}

export default compileNew;
