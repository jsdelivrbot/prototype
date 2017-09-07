/** @module assemblyscript/reflection */ /** */

import * as ts from "../typescript";
import Class from "./class";

/** Core type kinds including range aliases. */
export enum TypeKind {
  /** First integer of any size and signage. */
  FirstInteger = 0,
  /** First unsigned integer of any size. */
  FirstUnsigned = 0,
  /** Unsigned 8-bit integer type. */
  byte = 0,
  /** Unsigned 16-bit integer type. */
  ushort = 1,
  /** Unsigned 32-bit integer type. */
  uint = 2,
  /** Unsigned 64-bit integer type. */
  ulong = 3,
  /** Last unsigned integer of any size. */
  LastUnsigned = 4,
  /** Unsigned 32-/64-bit pointer type. */
  uintptr = 4,
  /** First signed integer of any size. */
  FirstSigned = 5,
  /** Signed 8-bit integer type. */
  sbyte = 5,
  /** Signed 16-bit integer type. */
  short = 6,
  /** Signed 32-bit integer type. */
  int = 7,
  /** Last signed integer of any size. */
  LastSigned = 8,
  /** Last integer of any size and signage. */
  LastInteger = 8,
  /** Signed 64-bit integer type. */
  long = 8,
  /** First float of any size. */
  FirstFloat = 9,
  /** 32-bit float type. */
  float = 9,
  /** Last float of any size. */
  LastFloat = 10,
  /** 64-bit float type. */
  double = 10,
  /** Bool type. */
  bool = 11,
  /** Void type. */
  void = 12
}

/** A reflected type. */
export class Type {

  /** Type kind. */
  kind: TypeKind;
  /** Size in linear memory. */
  size: number;
  /** The underlying class, if a pointer. */
  underlyingClass?: Class;
  /** The respective nullable type of this type, if applicable. */
  nullableType?: Type;
  /** The respective non-nullable type of this type, if applicable. */
  nonNullableType?: Type;

  /** Constructs a new reflected type. Not meant to introduce any types other than the core types. */
  constructor(kind: TypeKind, size: number, underlyingClass?: Class) {
    this.kind = kind;
    this.size = size;
    this.underlyingClass = underlyingClass;
  }

  /** Tests if this is an integer type of any size. */
  get isAnyInteger(): boolean { return this.kind >= TypeKind.FirstInteger && this.kind <= TypeKind.LastInteger; }
  /** Tests if this is a float type of any size. */
  get isAnyFloat(): boolean { return this.kind >= TypeKind.FirstFloat && this.kind <= TypeKind.LastFloat; }
  /** Tests if this is a numeric type of any size. */
  get isNumeric(): boolean { return !this.isClass; }
  /** Tests if this is a signed integer type of any size. */
  get isSigned(): boolean { return this.kind >= TypeKind.FirstSigned && this.kind <= TypeKind.LastSigned; }
  /** Tests if this is an 8-bit integer type of any signage. */
  get isByte(): boolean { return this.kind === TypeKind.byte || this.kind === TypeKind.sbyte; }
  /** Tests if this is a 16-bit integer type of any signage. */
  get isShort(): boolean { return this.kind === TypeKind.short || this.kind === TypeKind.ushort; }
  /** Tests if this is a 32-bit integer type of any signage. */
  get isInt(): boolean { return this.kind === TypeKind.int || this.kind === TypeKind.uint || (this.kind === TypeKind.uintptr && this.size === 4); }
  /** Tests if this is a 64-bit integer type of any signage. */
  get isLong(): boolean { return this.kind === TypeKind.long || this.kind === TypeKind.ulong || (this.kind === TypeKind.uintptr && this.size === 8); }
  /** Tests if this is a pointer with an underlying class. */
  get isClass(): boolean { return this.kind === TypeKind.uintptr && !!this.underlyingClass; }
  /** Tests if this is a pointer with an underlying array-like class. */
  get isArray(): boolean { return this.isClass && (<Class>this.underlyingClass).isArray; }
  /** Tests if this is a pointer with an underlying string-like class. */
  get isString(): boolean { return this.isClass && (<Class>this.underlyingClass).isString; }
  /** Tests if this is a nullable type. */
  get isNullable(): boolean { return this.nonNullableType !== null; }
  /** Gets the common name of a temporary variable of this type. */
  get tempName(): string { return "." + TypeKind[this.kind]; }

  /** Amends a pointer to reference the specified underlying class. */
  withUnderlyingClass(underlyingClass: Class): Type {
    if (this.kind !== TypeKind.uintptr)
      throw Error("uintptr expected");
    const type = new Type(this.kind, this.size);
    type.underlyingClass = underlyingClass;
    return type;
  }

  /** Derives the respective nullable type of this type. */
  asNullable(): Type {
    if (!this.nullableType) {
      if (!this.underlyingClass)
        throw Error("not a class type");
      this.nullableType = new Type(this.kind, this.size, this.underlyingClass);
      this.nullableType.nonNullableType = this;
    }
    return this.nullableType;
  }

  toString(): string {
    if (this.underlyingClass) {
      return this.isNullable
        ? this.underlyingClass.name + " | null"
        : this.underlyingClass.name;
    }
    return TypeKind[this.kind];
  }

  /** Reflected bool type. */
  static bool = new Type(TypeKind.bool, 1);
  /** Reflected signed 8-bit integer type. */
  static sbyte = new Type(TypeKind.sbyte, 1);
  /** Reflected unsigned 8-bit integer type. */
  static byte = new Type(TypeKind.byte, 1);
  /** Reflected signed 16-bit integer type. */
  static short = new Type(TypeKind.short, 2);
  /** Reflected unsigned 16-bit integer type. */
  static ushort = new Type(TypeKind.ushort, 2);
  /** Reflected signed 32-bit integer type. */
  static int = new Type(TypeKind.int, 4);
  /** Reflected unsigned 32-bit integer type. */
  static uint = new Type(TypeKind.uint, 4);
  /** Reflected signed 64-bit integer type. */
  static long = new Type(TypeKind.long, 8);
  /** Reflected unsigned 64-bit integer type. */
  static ulong = new Type(TypeKind.ulong, 8);
  /** Reflected 32-bit float type. */
  static float = new Type(TypeKind.float, 4);
  /** Reflected 64-bit float type. */
  static double = new Type(TypeKind.double, 8);
  /** Reflected 32-bit pointer type. Relevant only when compiling for 32-bit WebAssembly. */
  static uintptr32 = new Type(TypeKind.uintptr, 4);
  /** Reflected 64-bit pointer type. Relevant only when compiling for 64-bit WebAssembly. */
  static uintptr64 = new Type(TypeKind.uintptr, 8);
  /** Reflected void type. */
  static void = new Type(TypeKind.void, 0);
}

export default Type;

/** Interface describing a reflected type argument. */
export interface TypeArgument {
  /** Reflected type. */
  type: Type;
  /** TypeScript type node. */
  node: ts.TypeNode;
}

/** Interface describing a reflected type arguments map. */
export interface TypeArgumentsMap {
  [key: string]: TypeArgument;
}
