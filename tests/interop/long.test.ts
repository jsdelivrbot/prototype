import * as tape from "tape";
import { hexdump, Module, Long, arrayHeaderSize } from "../util";

export function test(test: tape.Test, module: Module) {

  const exports = module.exports;
  const memory = module.memory;

  let ptr = exports.getLongArray();

  // note that it is not possible to return or provide a long directly.
  // we have to use memory access instead.

  // check initialization
  console.log(hexdump(memory, ptr, arrayHeaderSize + 8));
  var val = memory.long.get(ptr + arrayHeaderSize);
  test.same(val, { low: -1, high: 2147483647, unsigned: false }, "should have initialized a[0] = 9223372036854775807");
  test.ok(Long.isLong(val), "should return a Long instance");

  // check set in memory
  val = Long.fromString("-9223372036854775808", false);
  memory.long.set(ptr + arrayHeaderSize, val);
  console.log(hexdump(memory, ptr, arrayHeaderSize + 8));
  val = memory.long.get(ptr + arrayHeaderSize);
  test.same(val, { low: 0, high: -2147483648, unsigned: false }, "should have i64.set a[0] = -9223372036854775808");

  test.end();
}
