/** @module assemblyscript/reflection */ /** */

import { Compiler } from "../compiler";

/** Object kinds. Also used as filters. */
export const enum ReflectionObjectKind {
  Variable = 1 << 0,
  Enum = 1 << 1,
  FunctionTemplate = 1 << 2,
  Function = 1 << 3,
  ClassTemplate = 1 << 4,
  Class = 1 << 5,
  Property = 1 << 6
}

/** Base class of all reflection objects. */
export abstract class ReflectionObject {

  /** Object kind. */
  kind: ReflectionObjectKind;
  /** Compiler reference. */
  compiler: Compiler;

  /** Constructs a neww reflection object. */
  constructor(kind: ReflectionObjectKind, compiler: Compiler) {
    this.compiler = compiler;
    this.kind = kind;
  }
}

export default ReflectionObject;
