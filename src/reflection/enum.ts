/** @module assemblyscript/reflection */ /** */

import * as ts from "../typescript";
import Compiler from "../compiler";
import Property from "./property";
import Type from "./type";

/** A reflected enum instance. */
export class Enum {

  /** Compiler reference. */
  compiler: Compiler;
  /** Global name. */
  name: string;
  /** Simple name. */
  simpleName: string;
  /** Declaration reference. */
  declaration: ts.EnumDeclaration;
  /** Enum values by simple name. */
  values: { [key: string]: Property };

  /** Constructs a new reflected enum and binds it to its TypeScript declaration. */
  constructor(compiler: Compiler, name: string, declaration: ts.EnumDeclaration) {
    this.compiler = compiler;
    this.name = name;
    this.declaration = declaration;
    this.simpleName = ts.getTextOfNode(this.declaration.name);

    // register
    if (compiler.enums[this.name])
      throw Error("duplicate enum: " + name);
    compiler.enums[this.name] = this;

    // initialize
    this.values = {};

    for (const member of this.declaration.members) {
      const memberName = ts.getTextOfNode(member.name);
      this.values[memberName] = new Property(this.compiler, memberName, member, Type.i32, 0, /* for completeness: */ member.initializer);
    }
  }

  toString(): string { return this.name; }
}

export default Enum;
