import * as tape from "tape";
import { hexdump, loader, arrayHeaderSize } from "../util";

export function test(test: tape.Test, module: loader.Module) {

  const exports = module.exports;
  const memory = module.memory;

  let ptr = exports.getArray();

  console.log(hexdump(memory, ptr, 4 * arrayHeaderSize + 6 * 4)); // 4 (nested) arrays, 6 int elements in total

  let array = memory.array.get(ptr);

  test.strictEqual(array.capacity, 3, "should have initialized an array of capacity 3");
  test.strictEqual(array.length, 3, "should have initialized an array of length 3");

  let array1 = memory.array.get(memory.uint.get(array.base));

  test.strictEqual(array1.capacity, 4, "should have initialized inner array 1 of capacity 4");
  test.strictEqual(array1.length, 4, "should have initialized inner array 1 of length 4");
  [1, 2, 0, 3].forEach((value, index) => {
    test.strictEqual(memory.int.get(array1.base + index * 4), value, "should have initialized array1[" + index + "] = " + value);
  });

  let array2 = memory.array.get(memory.uint.get(array.base + 4));
  test.strictEqual(array2.capacity, 2, "should have initialized inner array 2 of capacity 2");
  test.strictEqual(array2.length, 2, "should have initialized inner array 2 of length 2");
  [4, 5].forEach((value, index) => {
    test.strictEqual(memory.int.get(array2.base + index * 4), value, "should have initialized array2[" + index + "] = " + value);
  });

  let array3 = memory.array.get(memory.uint.get(array.base + 8));
  test.strictEqual(array3.capacity, 0, "should have initialized inner array 3 of capacity 0");
  test.strictEqual(array3.length, 0, "should have initialized inner array 3 of length 0");

  test.end();
}