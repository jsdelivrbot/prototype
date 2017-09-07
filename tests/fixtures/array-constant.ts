//! { "noRuntime": true }

const arrayLiteral: i32[] = [1,2,,-4];

export function getArrayLiteral(): int[] {
  return arrayLiteral;
}

const arrayInitializer: i32[] = new Array(3);

export function getArrayInitializer(): i32[] {
  return arrayInitializer;
}

const stringLiteral: string = "abc";

export function getStringLiteral(): string {
  return stringLiteral;
}

const stringInitializer: String = new String(3);

export function getStringInitializer(): String {
  return stringInitializer;
}
