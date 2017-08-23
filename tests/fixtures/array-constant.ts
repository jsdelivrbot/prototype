//! { "noRuntime": true }

const arrayLiteral: int[] = [1,2,3];

export function getArrayLiteral(): int[] {
  return arrayLiteral;
}

const arrayInitializer: int[] = new Array(3);

export function getArrayInitializer(): int[] {
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
