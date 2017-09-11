/** @module assemblyscript/reflection */ /** */

import * as ts from "../typescript";
import { Compiler } from "../compiler";
import { tryEvaluate } from "../expressions";
import { ReflectionObject, ReflectionObjectKind } from "./object";
import { Type } from "./type";
import { isExport } from "../util";

/** A reflected enum. */
export class Enum extends ReflectionObject {

  /** Declaration reference. */
  declaration: ts.EnumDeclaration;
  /** Enum values by simple name. */
  values: { [key: string]: EnumValue } = {};

  /** Constructs a new reflected enum. */
  constructor(compiler: Compiler, name: string, declaration: ts.EnumDeclaration) {
    super(ReflectionObjectKind.Enum, compiler, name);
    this.declaration = declaration;
  }

  /** Initializes a new reflected enum. */
  static initialize(compiler: Compiler, declaration: ts.EnumDeclaration): Enum {

    // EnumDeclaration
    // ├ EnumMeber
    // └ EnumMeber

    const sourceFile = ts.getSourceFileOfNode(declaration);
    const name = compiler.mangleGlobalName(ts.getTextOfNode(declaration.name), sourceFile);

    if (compiler.enums.hasOwnProperty(name))
      throw Error("duplicate enum name '" + name + "'");

    const enm = compiler.enums[name] = new Enum(compiler, name, declaration);

    // enums cannot be exported, yet
    if (sourceFile === compiler.entryFile && isExport(declaration))
      compiler.report(declaration.name, ts.DiagnosticsEx.Unsupported_modifier_0, "export");

    for (let i = 0, k = declaration.members.length; i < k; ++i) {
      const member = declaration.members[i];
      const memberName = ts.getTextOfNode(member.name);

      if (enm.values.hasOwnProperty(memberName))
        throw Error("duplicate enum value name '" + memberName + "' in enum '" + name + "'");

      let value: number | null = null;
      if (member.initializer) {
        value = <number | null>tryEvaluate(member.initializer, Type.i32);
        if (value === null)
          compiler.report(member.initializer, ts.DiagnosticsEx.Unsupported_constant_expression);
      }
      if (value === null) {
        const keys = Object.keys(enm.values);
        value = keys.length ? enm.values[keys[keys.length - 1]].value + 1 : 0;
      }

      enm.values[memberName] = new EnumValue(compiler, memberName, member, value);
    }
    return enm;
  }
}

/** A reflected enum value. */
export class EnumValue extends ReflectionObject {

  /** Value name. */
  name: string;
  /** Declaration reference. */
  declaration: ts.EnumMember;
  /** Value. */
  value: number;

  constructor(compiler: Compiler, name: string, declaration: ts.EnumMember, value: number) {
    super(ReflectionObjectKind.EnumValue, compiler, name);
    this.declaration = declaration;
    this.value = value;
  }
}

export default Enum;
