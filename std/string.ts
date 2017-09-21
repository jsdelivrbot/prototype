export class String extends Array<u16> {

  indexOfString(value: string): i32 { // FIXME: any way to overload this?
    if (value.length > this.length)
      return -1;
    const thisPtr: usize = unsafe_cast<String,usize>(this) + sizeof<Array<u16>>();
    const valuePtr: usize = unsafe_cast<string,usize>(value) + sizeof<Array<u16>>();
    const limitPtr: usize = this.length - value.length;
    for (let offsetPtr: usize = 0; offsetPtr < limitPtr; offsetPtr += sizeof<u16>())
      if (memcmp(thisPtr + offsetPtr, valuePtr, value.length) == 0)
        return offsetPtr as i32;
    return -1;
  }

  startsWith(value: string): bool {
    if (value.length > this.length)
      return false;
    const thisPtr: usize = unsafe_cast<String,usize>(this) + sizeof<Array<u16>>();
    const valuePtr: usize = unsafe_cast<string,usize>(value) + sizeof<Array<u16>>();
    return memcmp(thisPtr, valuePtr, value.length << 1) == 0;
  }

  endsWith(value: string): bool {
    if (value.length > this.length)
      return false;
    const thisPtr: usize = unsafe_cast<String,usize>(this) + sizeof<Array<u16>>();
    const valuePtr: usize = unsafe_cast<string,usize>(value) + sizeof<Array<u16>>();
    return memcmp(thisPtr + ((this.length - value.length) << 1) as usize, valuePtr, value.length) == 0;
  }
}
