import * as tape from "tape";
import { hexdump, loader, Long, arrayHeaderSize } from "../util";

export function test(test: tape.Test, module: loader.Module) {

  const exports = module.exports;
  const memory = module.memory;

  const ptr = 8;

  console.log(hexdump(memory, ptr, 4));

  test.strictEqual(memory.int.get(ptr), 0, "should have initialized mem[4-7]<int> = 0");
  test.strictEqual(exports.doload(ptr), 0, "should load mem[4-7]<int> = 0")

  exports.dostore(ptr, 123);

  console.log(hexdump(memory, ptr, 4));

  test.strictEqual(memory.int.get(ptr), 123, "should have set mem[4-7]<int> = 123");
  test.strictEqual(exports.doload(ptr), 123, "should load mem[4-7]<int> = 123");

  test.end();
}
