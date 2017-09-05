//! { "noRuntime": true }

export function test(): void {
  throw new Error("generic"); // just becomes 'unreachable' for now
}
