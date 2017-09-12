import * as tape from "tape";
import { hexdump, loader, arrayHeaderSize } from "../util";

export function test(test: tape.Test, module: loader.Module) {

  const exports = module.exports;
  const memory = module.memory;

  let floatPtr = exports.getFloatArray();
  let floatBase = memory.u32.get(floatPtr + 8);
  let doublePtr = exports.getDoubleArray();
  let doubleBase = memory.u32.get(doublePtr + 8);

  // check float return values and memory accessor
  console.log(hexdump(memory, floatBase, 4));
  test.strictEqual(exports.getFloatValue(), 0.125, "should have initialized a = 0.125");
  test.strictEqual(memory.f32.get(floatBase), 0.125, "should f32.get the same value");

  // check double return values and memory accessor
  console.log(hexdump(memory, doubleBase, 8));
  test.strictEqual(exports.getDoubleValue(), 1.25, "should have initialized b = 1.25");
  test.strictEqual(memory.f64.get(doubleBase), 1.25, "should f64.get the same value");

  // check float setter
  exports.setFloatValue(0.25);
  console.log(hexdump(memory, floatBase, 4));
  test.strictEqual(exports.getFloatValue(), 0.25, "should have set a = 0.25");

  // check double setter
  exports.setDoubleValue(2.5);
  console.log(hexdump(memory, doubleBase, 8));
  test.strictEqual(exports.getDoubleValue(), 2.5, "should have set b = 2.5");

  // check setting float in memory
  memory.f32.set(floatBase, 0.5);
  console.log(hexdump(memory, floatBase, 4));
  test.strictEqual(exports.getFloatValue(), 0.5, "should have f32.set a = 0.5");

  // check setting double in memory
  memory.f64.set(doubleBase, 5.5);
  console.log(hexdump(memory, doubleBase, 8));
  test.strictEqual(exports.getDoubleValue(), 5.5, "should have f64.set b = 5.5");

  test.end();
}