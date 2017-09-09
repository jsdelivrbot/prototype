/** @module assemblyscript/reflection */ /** */

import { Compiler } from "../compiler";

/** Object kinds. Also used as filters. */
export const enum ReflectionObjectKind {
  GlobalVariable = 1 << 0,
  Enum = 1 << 1,
  EnumValue = 1 << 2,
  FunctionTemplate = 1 << 3,
  Function = 1 << 4,
  LocalVariable = 1 << 5,
  ClassTemplate = 1 << 6,
  Class = 1 << 7,
  Property = 1 << 8
}

/** Base class of all reflection objects. */
export abstract class ReflectionObject {

  /** Object kind. */
  kind: ReflectionObjectKind;
  /** Compiler reference. */
  compiler: Compiler;
  /** Global name. */
  name: string;

  /** Constructs a new reflection object. */
  constructor(kind: ReflectionObjectKind, compiler: Compiler, name: string) {
    this.compiler = compiler;
    this.kind = kind;
    this.name = name;
  }

  toString(): string { return this.name; }
}

export default ReflectionObject;
