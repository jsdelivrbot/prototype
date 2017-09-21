/**
 * TypeScript definition file for AssemblyScript compilation.
 * see: https://github.com/dcodeIO/AssemblyScript for details
 *
 * @module assembly
 */

// Core types

/** An 8-bit signed integer. */
declare type i8 = number;
/** An 8-bit unsigned integer. */
declare type u8 = number;
/** A 16-bit signed integer. */
declare type i16 = number;
/** A 16-bit unsigned integer. */
declare type u16 = number;
/** A 32-bit signed integer. */
declare type i32 = number;
/** A 32-bit unsigned integer. */
declare type u32 = number;
/** A 64-bit signed integer. */
declare type i64 = number;
/** A 64-bit unsigned integer. */
declare type u64 = number;
/** A 32-bit float. */
declare type f32 = number;
/** A 64-bit float. */
declare type f64 = number;
/** A 1-bit unsigned integer. */
declare type bool = any; // as required for logical '&&' / '||'
/** A 32-bit unsigned integer when targeting WASM32 respectively a 64-bit unsigned integer when targeting WASM64. */
declare type usize = number;

// Core type aliases

/** An 8-bit signed integer. Alias of `i8`. */
declare type sbyte = i8;
/** An 8-bit unsigned integer. Alias of `u8`. */
declare type byte = u8;
/** A 16-bit signed integer. Alias of `i16`. */
declare type short = i16;
/** A 16-bit unsigned integer. Alias of `u16`. */
declare type ushort = u16;
/** A 32-bit signed integer. Alias of `i32`. */
declare type int = i32;
/** A 32-bit signed integer. Alias of `u32`. */
declare type uint = u32;
/** A 64-bit signed integer. Alias of `i64`. */
declare type long = i64;
/** A 64-bit unsigned integer. Alias of `u64`. */
declare type ulong = u64;
/** A 32-bit float. Alias of `f32`. */
declare type float = f32;
/** A 64-bit float. Alias of `f64`. */
declare type double = f64;
/** A 32-bit unsigned integer when targeting WASM32 respectively a 64-bit unsigned integer when targeting WASM64. Alias of `usize`. */
declare type uintptr = usize;

/** An 8-bit signed integer. Alias of `i8`. */
declare type int8 = i8;
/** An 8-bit unsigned integer. Alias of `u8`. */
declare type uint8 = u8;
/** A 16-bit signed integer. Alias of `i16`. */
declare type int16 = i16;
/** A 16-bit unsigned integer. Alias of `u16`. */
declare type uint16 = u16;
/** A 32-bit signed integer. Alias of `i32`. */
declare type int32 = i32;
/** A 32-bit signed integer. Alias of `u32`. */
declare type uint32 = u32;
/** A 64-bit signed integer. Alias of `i64`. */
declare type int64 = i64;
/** A 64-bit unsigned integer. Alias of `u64`. */
declare type uint64 = u64;
/** A 32-bit float. Alias of `f32`. */
declare type float32 = f32;
/** A 64-bit float. Alias of `f64`. */
declare type float64 = f64;

// Globals

/** NaN (not a number) as a 64-bit float. */
declare const NaN: f64;
/** NaN (not a number) as a 32-bit float. */
declare const NaNf: f32;
/** Positive infinity as a 64-bit float. */
declare const Infinity: f64;
/** Positive infinity as a 32-bit float. */
declare const Infinityf: f32;

// Arrays

/** A fixed-size array. */
declare class Array<T> implements IDisposable {
  /** Maximum number of elements this array can hold without resizing. */
  readonly capacity: i32;
  /** Number of elements this array currently holds. */
  length: i32;

  /** Constructs a new array with the specified number of elements. */
  constructor(arrayLength: i32);

  /** Returns the first index at which a given element can be found in the array, or `-1` if it is not present. The array is searched forward, starting at `fromIndex`. */
  indexOf(searchElement: T, fromIndex?: i32): i32;
  /** Returns the last index at which a given element can be found in the array, or `-1` if it is not present. The array is searched backwards, starting at `fromIndex`. */
  lastIndexOf(searchElement: T, fromIndex?: i32): i32;
  /** Creates a shallow copy of a portion of the array as a new array object selected from `begin` to `end` (`end` not included). The original array will not be modified. */
  slice(begin?: i32, end?: i32): this;
  /** Reverses the array's elements in place. The first array element becomes the last, and the last array element becomes the first. */
  reverse(): this;
  dispose(disposeData?: bool): void;
}

/** A fixed-size 8-bit signed integer array. */
declare class Int8Array extends Array<i8> {}
/** A fixed-size 8-bit unsigned integer array. */
declare class Uint8Array extends Array<u8> {}
/** A fixed-size 16-bit signed integer array. */
declare class Int16Array extends Array<i16> {}
/** A fixed-size 16-bit unsigned integer array. */
declare class Uint16Array extends Array<u16> {}
/** A fixed-size 32-bit signed integer array. */
declare class Int32Array extends Array<i32> {}
/** A fixed-size 32-bit unsigned integer array. */
declare class Uint32Array extends Array<u32> {}
/** A fixed-size 64-bit signed integer array. */
declare class Int64Array extends Array<i64> {}
/** A fixed-size 64-bit unsigned integer array. */
declare class Uint64Array extends Array<u64> {}
/** A fixed-size 32-bit float array. */
declare class Float32Array extends Array<f32> {}
/** A fixed-size 64-bit float array. */
declare class Float64Array extends Array<f64> {}

// Strings

/** A fixed-size UTF-16LE encoded string. */
declare class String extends Array<u16> {
  /** Constructs a new string with the specified number of characters. */
  constructor(size: i32);

  /** Returns the index within the string of the first occurrence of the specified value or `-1` if the value is not found. */
  indexOfString(value: string): i32;
  /** Determines whether the string begins with the specified value. */
  startsWith(value: string): bool;
  /** Determines whether the string ends with the specified value. */
  endsWith(value: string): bool;
}

// Errors

/** An error. */
declare class Error {
  /** Error message. */
  message: string;
  /** Constructs a new error with the specified message. */
  constructor(message: string);
}

declare class RangeError extends Error {}
declare class ReferenceError extends Error {}
declare class TypeError extends Error {}

// Console

/** Imported log interface. */
declare function log(type: i32, message: string): void;

/** Console bindings. */
declare class console {
  /** Logs a message to console. */
  static log(message: string): void;
  /** Logs an informative message to console. */
  static info(message: string): void;
  /** Logs a warning message to console. */
  static warn(message: string): void;
  /** Logs an error message to console. */
  static error(message: string): void;
}

// Builtins

/** Performs the sign-agnostic rotate left operation on a 32-bit integer. */
declare function rotl(value: i32, shift: i32): i32;
/** Performs the sign-agnostic rotate left operation on a 64-bit integer. */
declare function rotll(value: i64, shift: i64): i64;
/** Performs the sign-agnostic rotate right operation on a 32-bit integer. */
declare function rotr(value: i32, shift: i32): i32;
/** Performs the sign-agnostic rotate right operation on a 64-bit integer. */
declare function rotrl(value: i64, shift: i64): i64;
/** Performs the sign-agnostic count leading zero bits operation on a 32-bit integer. All zero bits are considered leading if the value is zero. */
declare function clz(value: i32): i32;
/** Performs the sign-agnostic count leading zero bits operation on a 64-bit integer. All zero bits are considered leading if the value is zero. */
declare function clzl(value: i64): i64;
/** Performs the sign-agnostic count trailing zero bits operation on a 32-bit integer. All zero bits are considered trailing if the value is zero. */
declare function ctz(value: i32): i32;
/** Performs the sign-agnostic count trailing zero bits operation on a 64-bit integer. All zero bits are considered trailing if the value is zero. */
declare function ctzl(value: i64): i64;
/** Performs the sign-agnostic count number of one bits operation on a 32-bit integer. */
declare function popcnt(value: i32): i32;
/** Performs the sign-agnostic count number of one bits operation on a 64-bit integer. */
declare function popcntl(value: i64): i64;
/** Computes the absolute value of a 64-bit float. */
declare function abs(value: f64): f64;
/** Computes the absolute value of a 32-bit float. */
declare function absf(value: f32): f32;
/** Performs the ceiling operatoion on a 64-bit float. */
declare function ceil(value: f64): f64;
/** Performs the ceiling operation on a 32-bit float. */
declare function ceilf(value: f32): f32;
/** Performs the floor operation on a 64-bit float. */
declare function floor(value: f64): f64;
/** Performs the floor operation on a 32-bit float. */
declare function floorf(value: f32): f32;
/** Calculates the square root of a 64-bit float. */
declare function sqrt(value: f64): f64;
/** Calculates the square root of a 32-bit float. */
declare function sqrtf(value: f32): f32;
/** Rounds to nearest integer towards zero of a 64-bit float. */
declare function trunc(value: f64): f64;
/** Rounds to nearest integer towards zero of a 32-bit float. */
declare function truncf(value: f32): f32;
/** Rounds to nearest integer tied to even of a 64-bit float. */
declare function nearest(value: f64): f64;
/** Rounds to nearest integer tied to even of a 32-bit float. */
declare function nearestf(value: f32): f32;
/** Determines the minimum of two 64-bit floats. If either operand is NaN, returns NaN. */
declare function min(left: f64, right: f64): f64;
/** Determines the minimum of two 32-bit floats. If either operand is NaN, returns NaN. */
declare function minf(left: f32, right: f32): f32;
/** Determines the maximum of two 64-bit floats. If either operand is NaN, returns NaN. */
declare function max(left: f64, right: f64): f64;
/** Determines the maximum of two 32-bit floats. If either operand is NaN, returns NaN. */
declare function maxf(left: f32, right: f32): f32;
/** Composes a 64-bit float from the magnitude of `x` and the sign of `y`. */
declare function copysign(x: f64, y: f64): f64;
/** Composes a 32-bit float from the magnitude of `x` and the sign of `y`. */
declare function copysignf(x: f32, y: f32): f32;
/** Reinterprets the bits of a 32-bit float as a 32-bit integer. */
declare function reinterpreti(value: f32): i32;
/** Reinterprets the bits of a 64-bit float as a 64-bit integer. */
declare function reinterpretl(value: f64): i64;
/** Reinterprets the bits of a 32-bit integer as a 32-bit float. */
declare function reinterpretf(value: i32): f32;
/** Reinterprets the bits of a 64-bit integer as a 64-bit double. */
declare function reinterpretd(value: i64): f64;
/** Returns the current memory size in units of pages. One page is 64kb. */
declare function current_memory(): i32;
/** Grows linear memory by a given unsigned delta of pages. One page is 64kb. Returns the previous memory size in units of pages or `-1` on failure. */
declare function grow_memory(value: i32): i32;
/** Emits an unreachable operation that results in a runtime error when executed. */
declare function unreachable(): void;

/** Determines the byte size of the specified core or class type. Compiles to a constant. */
declare function sizeof<T>(): usize;
/** Loads a value of the specified type from memory. */
declare function load<T>(offset: usize): T;
/** Stores a value of the specified type to memory. */
declare function store<T>(offset: usize, value: T): void;
/** Casts a value of type `T1` to a value of type `T2`. Useful for casting classes to pointers and vice-versa. Does not perform any checks. */
declare function unsafe_cast<T1,T2>(value: T1): T2;
/** Tests if a 64-bit float is a NaN. */
declare function isNaN(value: f64): bool;
/** Tests if a 32-bit float is a NaN. */
declare function isNaNf(value: f32): bool;
/** Tests if a 64-bit float is finite. */
declare function isFinite(value: f64): bool;
/** Tests if a 32-bit float is finite. */
declare function isFinitef(value: f32): bool;

// Core runtime

/** Sets a chunk of memory to the provided value `c`. Usually used to reset it to all `0`s. */
declare function memset(dest: usize, c: i32, size: usize): usize;
/** Copies data from one chunk of memory to another. */
declare function memcpy(dest: usize, src: usize, size: usize): usize;
/** Compares a chunk of memory to another. Returns `0` if both are equal, otherwise the difference `vl[i] - vr[i]` of the first differing byte values. */
declare function memcmp(left: usize, right: usize, size: usize): i32;
/** Allocates a chunk of memory of the specified size. */
declare function malloc(size: usize): usize;
/** Changes the size of an allocated memory block. */
declare function realloc(ptr: usize, size: usize): usize;
/** Frees a previously allocated chunk of memory. */
declare function free(ptr: usize): void;

// Experimental garbage collector runtime

/** Pauses automatic garbage collection. */
declare function gc_pause(): void;
/** Resumes automatic garbage collection. */
declare function gc_resume(): void;
/** Runs the garbage collector. */
declare function gc_collect(): void;
/** Allocates a garbage collector controlled chunk of memory of the specified size. */
declare function gc_alloc(size: usize, flags: i32): usize;
/** Changes the size of a garbage collector controlled memory block. */
declare function gc_realloc(ptr: usize, size: usize): usize;
/** Retains a gargabe collector controlled memory block. */
declare function gc_retain(ptr: usize): usize;
/** Releases a garbage collector controlled memory block previously retained. */
declare function gc_release(ptr: usize): usize;

// Temporary fillers

/** @private */ declare interface Boolean {}
/** @private */ declare interface Function {}
/** @private */ declare interface IArguments {}
/** @private */ declare interface Number {}
/** @private */ declare interface Object {}
/** @private */ declare interface RegExp {}
/** @private */ declare interface Symbol {}

// Interfaces

/** Marks a class as being disposable (can be free'd from memory manually). */
declare interface IDisposable {
  /** Releases this instance's memory by calling `free`. The instance or a reference to it must not be used anymore afterwards. */
  dispose(): void;
}

// Internal decorators
declare function no_implicit_malloc();
