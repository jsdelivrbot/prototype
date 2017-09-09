/** @module assemblyscript/reflection */ /** */

import { Compiler } from "../compiler";
import { ReflectionObject, ReflectionObjectKind } from "./object";
import { Type } from "./type";

/** A reflected variable. */
export class Variable extends ReflectionObject {

  /** Simple or global name, depending on context. */
  name: string;
  /** Reflected type. */
  type: Type;
  /** Whether mutable or not. */
  mutable: boolean;
  /** Local index, if applicable. */
  localIndex: number;
  /** Constant value, if applicable. */
  constantValue: number | Long | null;

  /** Constructs a new reflected variable. */
  constructor(compiler: Compiler, name: string, type: Type, mutable: boolean = true, localIndex: number = -1, constantValue: number | Long | null = null) {
    super(ReflectionObjectKind.Variable, compiler);
    this.name = name;
    this.type = type;
    this.mutable = mutable;
    this.localIndex = localIndex;
    this.constantValue = constantValue;

    // register
    if (localIndex < 0) {
      if (compiler.globals[this.name])
        throw Error("duplicate global: " + this.name);
      compiler.globals[this.name] = this;
    }
  }

  /** Tests if this variable is declared constant. */
  get isConstant(): boolean { return !this.mutable; }
  /** Tests if this is a global variable. */
  get isGlobal(): boolean { return this.localIndex < 0; }
  /** Tests if this is a local variable. */
  get isLocal(): boolean { return this.localIndex >= 0; }
  /** Tests if this variable's value is inlined. */
  get isInlined(): boolean { return this.isConstant && this.constantValue !== null; }

  toString(): string { return this.name; }
}

export default Variable;
