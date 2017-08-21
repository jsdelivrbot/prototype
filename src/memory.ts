/**
 * Static memory utilizies.
 *
 * @module assemblyscript/builtins
 */ /** */

import Compiler from "./compiler";
import * as Long from "long";
import * as util from "./util";
import * as reflection from "./reflection";

/** A static memory segment. */
export interface MemorySegment {
  /** Offset in static memory. */
  offset: Long;
  /** Contents. */
  buffer: Uint8Array;
}

/** A static memory. */
export class Memory {

  /** Compiler reference. */
  compiler: Compiler;
  /** Base offset. */
  baseOffset: Long;
  /** Current offset. */
  currentOffset: Long;
  /** Static memory segments. */
  segments: MemorySegment[] = [];
  /** Pool of reusable static strings. */
  stringPool: { [key: string]: MemorySegment } = {};

  /** Constructs a new static memory instance. */
  constructor(compiler: Compiler, baseOffset: number | Long) {
    this.compiler = compiler;
    if (!Long.isLong(baseOffset))
      baseOffset = Long.fromInt(<number>baseOffset, true);
    this.currentOffset = <Long>baseOffset;
    this.baseOffset = this.align();
  }

  /** Aligns the current offset to 8 bytes. */
  align(): Long {
    return this.currentOffset.and(7).eq(0)
      ? this.currentOffset
      : this.currentOffset = this.currentOffset.or(7).add(1);
  }

  /** Creates a static string. */
  createString(value: string, reuse: boolean = true): MemorySegment {
    if (reuse && this.stringPool.hasOwnProperty(value))
      return this.stringPool[value];

    const values = new Array(value.length);
    for (let i = 0; i < value.length; ++i)
      values[i] = value.charCodeAt(i);

    const array = this.createArray(values, reflection.ushortType);
    if (reuse)
      this.stringPool[value] = array;

    return array;
  }

  /** Creates a static array. */
  createArray(values: Array<number | Long>, type: reflection.Type): MemorySegment {
    const startOffset = this.align();
    const length = values.length;
    const buffer = new Uint8Array(this.compiler.arrayHeaderSize + type.size * length);

    if (length < 0 || length > 0x7fffffff)
      throw Error("length exceeds 31-bits");

    util.writeInt(buffer, 0, length);
    util.writeInt(buffer, 4, length);

    // create segment and advance (elements might result in more segments)
    this.currentOffset = this.currentOffset.add(buffer.length);
    const segment = { offset: startOffset, buffer };
    this.segments.push(segment);

    let innerOffset = 8;
    switch (type.kind) {

      case reflection.TypeKind.bool:
        for (const value of values)
          innerOffset += util.writeBool(buffer, innerOffset, value);
        break;

      case reflection.TypeKind.sbyte:
      case reflection.TypeKind.byte:
        for (const value of values)
          innerOffset += util.writeByte(buffer, innerOffset, <number>value);
        break;

      case reflection.TypeKind.short:
      case reflection.TypeKind.ushort:
        for (const value of values)
          innerOffset += util.writeShort(buffer, innerOffset, <number>value);
        break;

      case reflection.TypeKind.int:
      case reflection.TypeKind.uint:
        for (const value of values)
          innerOffset += util.writeInt(buffer, innerOffset, Long.isLong(value) ? (<Long>value).toInt() : <number>value);
        break;

      case reflection.TypeKind.long:
      case reflection.TypeKind.ulong:
        for (const value of values)
          innerOffset += util.writeLong(buffer, innerOffset, Long.fromValue(value));
        break;

      case reflection.TypeKind.uintptr: {
        if (this.compiler.uintptrType === reflection.uintptrType32)
          for (const value of values)
            innerOffset += util.writeInt(buffer, innerOffset, Long.isLong(value) ? (<Long>value).toInt() : <number>value);
        else
          for (const value of values)
            innerOffset += util.writeLong(buffer, innerOffset, Long.fromValue(value));
        break;
      }
      case reflection.TypeKind.float:
        for (const value of values)
          innerOffset += util.writeFloat(buffer, innerOffset, <number>value);
        break;

      case reflection.TypeKind.double:
        for (const value of values)
          innerOffset += util.writeDouble(buffer, innerOffset, <number>value);
        break;

      default:
        throw Error("unsupported static type: " + type);
    }

    return segment;
  }

  // TODO
  // createInstance(values: { [key: string]: any }, type: reflection.Class): MemorySegment {
  // }
}

export { Memory as default };
