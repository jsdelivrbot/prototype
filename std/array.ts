export class Array<T> implements IDisposable {
  readonly capacity: i32; // @0 (4)
  length: i32;            // @4 (4)
  readonly base: usize;   // @8 (4/8)

  constructor(capacity: i32) {
    if (capacity < 0)
      throw new Error("Invalid array length");
    this.length = this.capacity = capacity;
    const dataSize: usize = this.capacity as usize * sizeof<T>();
    this.base = memset(malloc(dataSize), 0, dataSize);
  }

  indexOf(searchElement: T, fromIndex: i32 = 0): i32 {
    let length: i32 = this.length;
    if (length > this.capacity)
      length = this.capacity;

    // if negative, it is taken as the offset from the end of the array
    if (fromIndex < 0) {
      fromIndex = length + fromIndex;

      // if the calculated index is less than 0, then the whole array will be searched
      if (fromIndex < 0)
        fromIndex = 0;
    }

    // implicit: if greater than or equal to the array's length, -1 is returned
    while (fromIndex < length) {
      if (this[fromIndex] == searchElement)
        return fromIndex;
      ++fromIndex;
    }
    return -1;
  }

  lastIndexOf(searchElement: T, fromIndex: i32 = 0x7fffffff): i32 {
    let length: i32 = this.length;
    if (length > this.capacity)
      length = this.capacity;

     // if negative, it is taken as the offset from the end of the array
    if (fromIndex < 0)
      fromIndex = length + fromIndex;

    // if greater than or equal to the length of the array, the whole array will be searched
    else if (fromIndex >= length)
      fromIndex = length - 1;

    // implicit: if the calculated index is less than 0, -1 is returned
    while (fromIndex >= 0) {
      if (this[fromIndex] == searchElement)
        return fromIndex;
      --fromIndex;
    }
    return -1;
  }

  slice(begin: i32 = 0, end: i32 = 0x7fffffff): this {
    let length: i32 = this.length;
    if (length > this.capacity)
      length = this.capacity;

    if (begin < 0) {
      begin = length + begin;
      if (begin < 0)
        begin = 0;
    } else if (begin > length)
      begin = length;

    if (end < 0)
      end = length + end;
    else if (end > length)
      end = length;

    if (end < begin)
      end = begin;

    const capacity: i32 = end - begin;
    const dataSize: usize = (capacity as usize) * sizeof<T>();

    const slice: usize = malloc(sizeof<Array<T>>());
    store<i32>(slice, capacity);
    store<i32>(slice + 4, capacity);
    store<usize>(slice + 8, this.base + begin * sizeof<T>());
    return unsafe_cast<usize,this>(slice);
  }

  reverse(): this {
    let length: int = this.length;
    if (length > this.capacity)
      length = this.capacity;

    // transposes the elements of the calling array object in place, mutating the array
    for (let i: int = 0, j: int = length - 1, t: int; i < j; ++i, --j) {
      t = this[i];
      this[i] = this[j];
      this[j] = t;
    }

    // and returning a reference to the array
    return this;
  }

  dispose(disposeData: bool = true): void {
    free(unsafe_cast<this,usize>(this));
    if (disposeData)
      free(this.base);
  }
}
