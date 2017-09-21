export class Error {
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}

export class RangeError extends Error {}
export class ReferenceError extends Error {}
export class TypeError extends Error {}
