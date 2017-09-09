/** @module assemblyscript/reflection */ /** */

import * as ts from "../typescript";
import { Compiler } from "../compiler";
import { Type } from "./type";
import { ReflectionObject, ReflectionObjectKind } from "./object";
import { isStatic } from "../util";

/** A reflected property. Also used to describe enum values. */
export class Property extends ReflectionObject {

  /** Global name. */
  name: string;
  /** Simple name. */
  simpleName: string;
  /** Declaration reference. */
  declaration: ts.PropertyDeclaration | ts.EnumMember;
  /** Resolved type. */
  type: Type;
  /** Offset in memory, if applicable. */
  offset: number;
  /** Initializer expression, if applicable. */
  initializer: ts.Expression | undefined;

  /** Constructs a new reflected property. */
  constructor(compiler: Compiler, name: string, declaration: ts.PropertyDeclaration | ts.EnumMember, type: Type, offset: number, initializer?: ts.Expression) {
    super(ReflectionObjectKind.Property, compiler);
    this.name = name;
    this.declaration = declaration;
    this.simpleName = ts.getTextOfNode(this.declaration.name);
    this.type = type;
    this.offset = offset;
    this.initializer = initializer;
  }

  /** Tests if this property is an instance member. */
  get isInstance(): boolean { return this.declaration.kind !== ts.SyntaxKind.EnumMember && !isStatic(this.declaration); }

  toString(): string { return this.name; }
}

export default Property;
