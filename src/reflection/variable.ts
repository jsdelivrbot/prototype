/** @module assemblyscript/reflection */ /** */

import { Compiler } from "../compiler";
import { ReflectionObject, ReflectionObjectKind } from "./object";
import { Type } from "./type";

/** Common base class of {@link GlobalVariable} and {@link LocalVariable}. */
export abstract class VariableBase extends ReflectionObject {

  /** Reflected type. */
  type: Type;
  /** Whether mutable or not. */
  mutable: boolean;
  /** Constant value, if applicable, otherwise `null`. */
  constantValue: number | Long | null;

  /** Constructs a new reflected global variable. */
  constructor(kind: ReflectionObjectKind, compiler: Compiler, name: string, type: Type, mutable: boolean = true, constantValue: number | Long | null = null) {
    super(kind, compiler, name);
    this.type = type;
    this.mutable = mutable;
    this.constantValue = constantValue;
  }

  /** Tests if this variable is declared constant. */
  get isConstant(): boolean { return !this.mutable; }
  /** Tests if this variable's value is inlineable. */
  get isInlineable(): boolean { return !this.mutable && this.constantValue !== null; }
}

/** A reflected global variable. */
export class GlobalVariable extends VariableBase {

  /** Constructs a new reflected global variable. */
  constructor(compiler: Compiler, name: string, type: Type, mutable: boolean = true, constantValue: number | Long | null = null) {
    super(ReflectionObjectKind.GlobalVariable, compiler, name, type, mutable, constantValue);
    if (compiler.globals.hasOwnProperty(this.name))
      throw Error("duplicate global variable name '" + this.name + "'");
    compiler.globals[this.name] = this;
  }
}

/** A reflected local variable. */
export class LocalVariable extends VariableBase {

  /** Local name. */
  name: string;
  /** Local variable index. */
  index: number;

  /** Constructs a new reflected local variable. */
  constructor(compiler: Compiler, name: string, type: Type, index: number, mutable: boolean = true, constantValue: number | Long | null = null) {
    super(ReflectionObjectKind.LocalVariable, compiler, name, type, mutable, constantValue);
    this.index = index;
  }
}
