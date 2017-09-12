import * as Long from "long";
import * as loader from "../lib/loader/src";
export { Long, loader };

export const arrayHeaderSize = 12; // capacity:i32 + length:i32 + base:i32

export function hexdump(memory: WebAssembly.Memory, offset: number, length: number): string {
  var buffer = new Uint8Array(memory.buffer);
  var out: string[] = [];
  for (let i = 0; i < length; ++i) {
    let b = buffer[offset + i].toString(16);
    if (b.length < 2) b = "0" + b;
    if ((i % 16) === 0) {
      let l = (offset + i).toString(16);
      while (l.length < 6) l = "0" + l;
      if (i > 0)
        out.push("\n");
      out.push("> " + l + ":");
    }
    out.push(" " + b);
  }
  return out.join("");
}
