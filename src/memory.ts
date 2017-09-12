/**
 * Static memory utilizies.
 *
 * @module assemblyscript/memory
 */ /** */

import * as Long from "long";
import { Compiler } from "./compiler";
import { writeBool, writeByte, writeShort, writeInt, writeLong, writeFloat, writeDouble } from "./util";
import { Type, TypeKind } from "./reflection";

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

  /** Creates a static segment. */
  /* createBuffer(buffer: Uint8Array): MemorySegment {
    const offset = this.align();
    const segment = { offset, buffer };
    this.segments.push(segment);
    return segment;
  } */

  /** Creates a static string. */
  createString(value: string, reuse: boolean = true): MemorySegment {
    if (reuse && this.stringPool.hasOwnProperty(value))
      return this.stringPool[value];

    const values = new Array(value.length);
    for (let i = 0; i < value.length; ++i)
      values[i] = value.charCodeAt(i);

    const array = this.createArray(values, Type.u16);
    if (reuse)
      this.stringPool[value] = array;

    return array;
  }

  /** Creates a static array. */
  createArray(values: Array<number | Long | string | null>, type: Type): MemorySegment {
    const startOffset = this.align();
    const length = values.length;
    const buffer = new Uint8Array(this.compiler.arrayHeaderSize + type.size * length); // header and data next to each other

    if (length < 0 || length > 0x7fffffff)
      throw Error("length exceeds 31-bits");

    writeInt(buffer, 0, length);
    writeInt(buffer, 4, length);
    if (this.compiler.usizeType === Type.usize32)
      writeInt(buffer, 8, startOffset.toInt() + 4 + 4 + 4);
    else
      writeLong(buffer, 8, startOffset.add(4 + 4 + 8));

    // create segment and advance (elements might result in more segments)
    this.currentOffset = this.currentOffset.add(buffer.length);
    const segment = { offset: startOffset, buffer };
    this.segments.push(segment);

    let innerOffset = this.compiler.arrayHeaderSize;
    switch (type.kind) {

      case TypeKind.bool:
        for (const value of values)
          innerOffset += writeBool(buffer, innerOffset, value);
        break;

      case TypeKind.i8:
      case TypeKind.u8:
        for (const value of values)
          innerOffset += writeByte(buffer, innerOffset, <number>value);
        break;

      case TypeKind.i16:
      case TypeKind.u16:
        for (const value of values)
          innerOffset += writeShort(buffer, innerOffset, <number>value);
        break;

      case TypeKind.i32:
      case TypeKind.u32:
        for (const value of values)
          innerOffset += writeInt(buffer, innerOffset, Long.isLong(value) ? (<Long>value).toInt() : <number>value);
        break;

      case TypeKind.i64:
      case TypeKind.u64:
        for (const value of values)
          innerOffset += writeLong(buffer, innerOffset, Long.fromValue(<Long>value));
        break;

      case TypeKind.usize: {
        if (this.compiler.usizeType === Type.usize32)
          for (const value of values)
            innerOffset += writeInt(buffer, innerOffset, Long.isLong(value) ? (<Long>value).toInt() : <number>value);
        else
          for (const value of values)
            innerOffset += writeLong(buffer, innerOffset, Long.fromValue(<Long>value));
        break;
      }
      case TypeKind.f32:
        for (const value of values)
          innerOffset += writeFloat(buffer, innerOffset, <number>value);
        break;

      case TypeKind.f64:
        for (const value of values)
          innerOffset += writeDouble(buffer, innerOffset, <number>value);
        break;

      default:
        throw Error("unsupported static type: " + type);
    }

    return segment;
  }

  // createInstance ?
}

export default Memory;
