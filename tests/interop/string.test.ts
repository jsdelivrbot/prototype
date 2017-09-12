import * as tape from "tape";
import { hexdump, loader, arrayHeaderSize } from "../util";

export function test(test: tape.Test, module: loader.Module) {

  const exports = module.exports;
  const memory = module.memory;

  let ptr = exports.getString();
  let base = memory.u32.get(ptr + 8);

  // check initialization in static memory
  console.log(hexdump(memory, ptr, arrayHeaderSize));
  console.log(hexdump(memory, base, 6));
  test.strictEqual(memory.string.get(ptr).value, "abc", "should have initialized a = 'abc'");

  // create a new string and set it by reference
  let string = memory.string.create("def");
  exports.setString(string.ptr);

  // verify that 'a' now references the temporary string
  console.log(hexdump(memory, string.ptr, arrayHeaderSize));
  test.strictEqual(exports.getString(), string.ptr, "should now reference the temporary string");
  console.log(hexdump(memory, string.base, 6));
  test.strictEqual(memory.string.get(string.ptr).value, "def", "should have set a = 'def'");

  // replace a character in memory
  memory.u16.set(string.base + 2, 103); // middle char = 'g'

  // verify that the character has been replaced
  console.log(hexdump(memory, string.ptr, arrayHeaderSize));
  test.strictEqual(exports.getString(), string.ptr, "should still reference the temporary string");
  console.log(hexdump(memory, string.base, 6));
  test.strictEqual(memory.string.get(string.ptr).value, "dgf", "should have replaced a[1] with 'g'");

  // reset to the initial string, by reference
  exports.setString(ptr);
  exports.free(string.ptr);
  exports.free(string.base);

  // verify that 'a' now references the initial string
  console.log(hexdump(memory, ptr, arrayHeaderSize));
  test.strictEqual(exports.getString(), ptr, "should now reference the initial string again");
  console.log(hexdump(memory, base, 6));
  test.strictEqual(memory.string.get(ptr).value, "abc", "should return a = 'abc'");

  test.end();
}