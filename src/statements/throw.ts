import * as binaryen from "binaryen";
import Compiler from "../compiler";
// import * as typescript from "../typescript";

export function compileThrow(compiler: Compiler/*, node: typescript.ThrowStatement*/): binaryen.Statement {
  const op = compiler.module;
  return op.unreachable();
}

export default compileThrow;
