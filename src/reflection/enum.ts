/** @module assemblyscript/reflection */ /** */

import * as ts from "../typescript";
import { Compiler } from "../compiler";
import { ReflectionObject, ReflectionObjectKind } from "./object";
import { isExport } from "../util";

/** A reflected enum. */
export class Enum extends ReflectionObject {

  /** Initializes a new reflected enum. */
  static initialize(compiler: Compiler, declaration: ts.EnumDeclaration): Enum {
    const sourceFile = ts.getSourceFileOfNode(declaration);
    const name = compiler.mangleGlobalName(ts.getTextOfNode(declaration.name), sourceFile);

    if (compiler.enums.hasOwnProperty(name))
      throw Error("duplicate enum name '" + name + "'");

    const enm = compiler.enums[name] = new Enum(compiler, name, declaration);

    // enums cannot be exported yet
    if (sourceFile === compiler.entryFile && isExport(declaration))
      compiler.report(declaration.name, ts.DiagnosticsEx.Unsupported_modifier_0, "export");

    for (let i = 0, k = declaration.members.length; i < k; ++i) {
      const member = declaration.members[i];
      const memberName = ts.getTextOfNode(member.name);

      if (enm.values.hasOwnProperty(memberName))
        throw Error("duplicate enum value name '" + memberName + "' in enum '" + name + "'");

      enm.values[memberName] = new EnumValue(compiler, memberName, member);
    }
    return enm;
  }

  /** Declaration reference. */
  declaration: ts.EnumDeclaration;
  /** Enum values by simple name. */
  values: { [key: string]: EnumValue } = {};

  /** Constructs a new reflected enum. */
  constructor(compiler: Compiler, name: string, declaration: ts.EnumDeclaration) {
    super(ReflectionObjectKind.Enum, compiler, name);
    this.declaration = declaration;
  }
}

/** A reflected enum value. */
export class EnumValue extends ReflectionObject {

  /** Value name. */
  name: string;
  /** Declaration reference. */
  declaration: ts.EnumMember;

  constructor(compiler: Compiler, name: string, declaration: ts.EnumMember) {
    super(ReflectionObjectKind.EnumValue, compiler, name);
    this.declaration = declaration;
  }
}

export default Enum;
