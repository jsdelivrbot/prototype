/** @module assemblyscript/expressions */ /** */

import * as ts from "../typescript";
import { Expression } from "binaryen";
import { Compiler } from "../compiler";
import { compileLoadOrStore } from "./helpers/loadorstore";
import { Type, Class, Enum, ReflectionObjectKind } from "../reflection";
import { getReflectedType, setReflectedType } from "../util";

/** Compiles a property access expression. Sets the property's value to `valueNode` if specified, otherwise gets it. */
export function compilePropertyAccess(compiler: Compiler, node: ts.PropertyAccessExpression, contextualType: Type, valueNode?: ts.Expression): Expression {
  const op = compiler.module;

  // fall back to contextual type on error
  setReflectedType(node, contextualType);

  // obtain the property's name
  const propertyName = ts.getTextOfNode(node.name);

  // handle globals
  if (node.expression.kind === ts.SyntaxKind.Identifier) {
    const reference = compiler.resolveReference(<ts.Identifier>node.expression, ReflectionObjectKind.Enum | ReflectionObjectKind.ClassTemplate | ReflectionObjectKind.Class);

    // enum values are constants
    if (reference instanceof Enum) {
      if (valueNode)
        throw Error("trying to assign to enum value"); // handled by typescript

      setReflectedType(node, Type.i32);

      const enm = <Enum>reference;
      const enmProperty = enm.values[propertyName];

      if (!enmProperty)
        throw Error("no such enum property"); // handled by typescript

      const value = compiler.checker.getConstantValue(<ts.EnumMember>enmProperty.declaration);
      if (typeof value === "number") {
        setReflectedType(node, enmProperty.type);
        return compiler.valueOf(enmProperty.type, value);
      }

      compiler.report(node.expression, ts.DiagnosticsEx.Unsupported_literal_0, value);
      return op.unreachable();

    // static class properties are globals
    } else if (reference instanceof Class) {
      const staticClass = <Class>reference;
      const staticClassProperty = staticClass.properties[propertyName];

      if (staticClassProperty && !staticClassProperty.isInstance) {

        const global = compiler.globals[staticClass.name + "." + propertyName];
        if (global) {

          if (valueNode) {
            const valueExpression = compiler.compileExpression(valueNode, global.type, global.type, false);

            if (contextualType === Type.void)
              return op.setGlobal(global.name, valueExpression);

            setReflectedType(node, global.type);
            const binaryenType = compiler.typeOf(global.type);
            return op.block("", [ // emulate tee_global
              op.setGlobal(global.name, valueExpression),
              op.getGlobal(global.name, binaryenType)
            ], binaryenType);

          } else {
            setReflectedType(node, global.type);
            return op.getGlobal(global.name, compiler.typeOf(global.type));
          }
        } else
          throw Error("unexpected uninitialized global");

      } else
        throw Error("no such static property '" + propertyName + "' on " + staticClass.name); // handled by typescript
    }
  }

  const expression = compiler.compileExpression(node.expression, compiler.usizeType);
  const expressionType = getReflectedType(node.expression);

  if (!(expressionType && expressionType.underlyingClass))
    throw Error("property access used on non-object"); // handled by typescript

  const clazz = expressionType.underlyingClass;
  const property = clazz.properties[propertyName];
  if (property) {
    setReflectedType(node, property.type);

    let valueExpression: Expression | undefined;
    if (valueNode)
      valueExpression = compiler.maybeConvertValue(valueNode, compiler.compileExpression(valueNode, property.type), getReflectedType(valueNode), property.type, false);

    return compileLoadOrStore(compiler, node, property.type, expression, property.offset, valueExpression, contextualType);
  } else {
    const method = clazz.methods[propertyName];
    if (method) {
      // TODO
      if (method.template.isGetter) {
        compiler.report(node, ts.DiagnosticsEx.Unsupported_modifier_0, "get");
      } else if (method.template.isSetter) {
        compiler.report(node, ts.DiagnosticsEx.Unsupported_modifier_0, "set");
      } else
        throw Error("trying to use a method as a property"); // handled by typescript
      return op.unreachable();
    } else
      throw Error("no such property"); // handled by typescript
  }
}

export default compilePropertyAccess;
