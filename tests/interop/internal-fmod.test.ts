import * as tape from "tape";
import { hexdump, Module, Long, arrayHeaderSize } from "../util";

export function test(test: tape.Test, module: Module) {

  const exports = module.exports;
  const memory = module.memory;

  // see src/builtins.ts/internal_fmod for details

  var args = [
    { x: 10, y: 3 },
    { x: -10, y: 3 },
    { x: 10, y: -3 },
    { x: -10, y: -3 }
    // { x: 4.22, y: 0.01 } // differs
  ];

  args.forEach(arg => {
    test.strictEqual(arg.x % arg.y, exports.fmod(arg.x, arg.y));
  });

  test.end();
}
