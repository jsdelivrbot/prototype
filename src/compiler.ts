/** @module assemblyscript */ /** */

import * as base64 from "@protobufjs/base64";
import * as binaryen from "binaryen";
import * as Long from "long";
import * as nodePath from "path";
import * as builtins from "./builtins";
import * as expressions from "./expressions";
import compileStore from "./expressions/helpers/store";
import * as arrayHelper from "./expressions/helpers/array";
import * as library from "./library";
import Memory from "./memory";
import { tryParseLiteral, tryParseArrayLiteral } from "./parser";
import Profiler from "./profiler";
import { Type, TypeKind, TypeArgumentsMap, Class, ClassTemplate, ClassHandle, Function, FunctionTemplate, FunctionHandle, Variable, Enum, ReflectionObjectKind, patchClassImplementation } from "./reflection";
import * as statements from "./statements";
import * as ts from "./typescript";
import * as util from "./util";

/** Library name prefix. */
export const LIB_PREFIX = "lib:";
/** Standard name prefix. */
export const STD_PREFIX = "std:";

/** Compiler options. */
export interface CompilerOptions {
  /** Whether compilation shall be performed in silent mode without writing to console. Defaults to `false`. */
  silent?: boolean;
  /** Specifies the target architecture. Defaults to {@link CompilerTarget.WASM32}. */
  target?: CompilerTarget | "wasm32" | "wasm64";
  /** Whether to disable built-in tree-shaking. Defaults to `false`. */
  noTreeShaking?: boolean;
  /** Whether to disallow implicit type conversions. Defaults to `false`. */
  noImplicitConversion?: boolean;
  /** Whether to exclude the runtime. */
  noRuntime?: boolean;
  /** Runtime functions to export, defaults to 'malloc' and 'free'. */
  exportRuntime?: string[];
}

/** Compiler target. */
export enum CompilerTarget {
  /** 32-bit WebAssembly target using uint pointers. */
  WASM32,
  /** 64-bit WebAssembly target using ulong pointers. */
  WASM64
}

// Malloc, free, etc. is present as a base64 encoded blob and prepared once when required.
let runtimeCache: Uint8Array;

/**
 * The AssemblyScript compiler.
 *
 * Common usage is covered by the static methods {@link Compiler.compileFile} and {@link Compiler.compileString}
 * for convenience. Their diagnostics go to {@link Compiler.lastDiagnostics}.
 */
export class Compiler {

  /** Diagnostic messages reported by the last invocation of {@link Compiler.compileFile} or {@link Compiler.compileString}. */
  static lastDiagnostics: ts.Diagnostic[];

  options: CompilerOptions;

  // TypeScript-related
  program: ts.Program;
  checker: ts.TypeChecker;
  entryFile: ts.SourceFile;
  libraryFile: ts.SourceFile;
  diagnostics: ts.DiagnosticCollection;

  // Binaryen-related
  module: binaryen.Module;
  signatures: { [key: string]: binaryen.Signature } = {};
  globalInitializers: binaryen.Expression[] = [];

  // Codegen
  target: CompilerTarget;
  profiler = new Profiler();
  currentFunction: Function;
  runtimeExports: string[];

  // Reflection
  usizeType: Type;
  functionTemplates: { [key: string]: FunctionTemplate } = {};
  classTemplates: { [key: string]: ClassTemplate } = {};
  globals: { [key: string]: Variable } = {};
  functions: { [key: string]: Function } = {};
  classes: { [key: string]: Class } = {};
  enums: { [key: string]: Enum } = {};
  startFunction: Function;
  startFunctionBody: ts.Statement[] = [];
  pendingImplementations: { [key: string]: ClassTemplate } = {};
  memory: Memory;

  /**
   * Compiles an AssemblyScript file to WebAssembly.
   * @param filename Entry file name
   * @param options Compiler options
   * @returns Compiled module or `null` if compilation failed. In case of failure, diagnostics are stored in {@link Compiler#diagnostics}.
   */
  static compileFile(filename: string, options?: CompilerOptions): binaryen.Module | null {
    return Compiler.compileProgram(
      ts.createProgram(
        Object.keys(library.files).concat(filename),
        ts.defaultCompilerOptions,
        ts.createCompilerHost([ process.cwd() ])
      ),
      options
    );
  }

  /**
   * Compiles an AssemblyScript string to WebAssembly.
   * @param source Source string
   * @param options Compiler options
   * @param fileName File to use for the entry file
   * @returns Compiled module or `null` if compilation failed. In case of failure, diagnostics are stored in {@link Compiler#diagnostics}.
   */
  static compileString(source: string, options?: CompilerOptions, fileName: string = "module.ts"): binaryen.Module | null {
    return Compiler.compileProgram(
      ts.createProgram(
        Object.keys(library.files).concat(fileName),
        ts.defaultCompilerOptions,
        ts.createCompilerHost([], source, fileName)
      ), options
    );
  }

  /**
   * Compiles a TypeScript program using AssemblyScript syntax to WebAssembly.
   * @param program TypeScript program
   * @param options Compiler options
   * @returns Compiled module or `null` if compilation failed. In case of failure, diagnostics are stored in {@link Compiler#diagnostics}.
   */
  static compileProgram(program: ts.Program, options?: CompilerOptions): binaryen.Module | null {
    const compiler = new Compiler(program, options);
    const silent = !!(options && options.silent);
    let hasErrors = false;

    Compiler.lastDiagnostics = [];

    // bail out if TypeScript reported 'pre emit' errors
    let diagnostics = ts.getPreEmitDiagnostics(compiler.program);
    for (let i = 0, k = diagnostics.length; i < k; ++i) {
      if (!silent)
        ts.printDiagnostic(diagnostics[i]);
      Compiler.lastDiagnostics.push(diagnostics[i]);
      if (diagnostics[i].category === ts.DiagnosticCategory.Error)
        hasErrors = true;
    }
    if (hasErrors) return null;

    if (!silent)
      compiler.profiler.start("initialize");
    compiler.initialize();
    if (!silent)
      (console.error || console.log)("initialization took " + compiler.profiler.end("initialize").toFixed(3) + " ms");

    // bail out if AssemblyScript reported initialization errors
    diagnostics = compiler.diagnostics.getDiagnostics();
    for (let i = 0, k = diagnostics.length; i < k; ++i) {
      Compiler.lastDiagnostics.push(diagnostics[i]);
      if (diagnostics[i].category === ts.DiagnosticCategory.Error)
        hasErrors = true;
    }
    if (hasErrors) return null;

    compiler.diagnostics = ts.createDiagnosticCollection();

    if (!silent)
      compiler.profiler.start("compile");
    compiler.compile();
    if (!silent)
      (console.error || console.log)("compilation took " + compiler.profiler.end("compile").toFixed(3) + " ms\n");

    // bail out if AssemblyScript reported compilation errors
    diagnostics = compiler.diagnostics.getDiagnostics();
    for (let i = 0, k = diagnostics.length; i < k; ++i) {
      Compiler.lastDiagnostics.push(diagnostics[i]);
      if (diagnostics[i].category === ts.DiagnosticCategory.Error)
        hasErrors = true;
    }
    if (hasErrors) return null;

    return compiler.module;
  }

  /** Gets the configured byte size of a pointer. `4` when compiling for 32-bit WebAssembly, `8` when compiling for 64-bit WebAssembly. */
  get usizeSize(): number { return this.usizeType.size; }

  /** Gets the size of an array header in bytes. */
  get arrayHeaderSize(): number { return 2 * Type.i32.size; } // capacity + length

  /**
   * Constructs a new AssemblyScript compiler.
   * @param program TypeScript program
   * @param options Compiler options
   */
  constructor(program: ts.Program, options?: CompilerOptions) {
    this.options = options || {};
    this.program = program;
    this.checker = program.getDiagnosticsProducingTypeChecker();
    this.diagnostics = ts.createDiagnosticCollection();

    if (typeof this.options.target === "string") {
      if (this.options.target.toLowerCase() === "wasm64")
        this.target = CompilerTarget.WASM64;
      else
        this.target = CompilerTarget.WASM32;
    } else if (typeof this.options.target === "number" && CompilerTarget[this.options.target])
      this.target = this.options.target;
    else
      this.target = CompilerTarget.WASM32;

    if (!this.options.noRuntime) {
      if (!runtimeCache)
        base64.decode(library.runtime, runtimeCache = new Uint8Array(base64.length(library.runtime)), 0);
      this.module = binaryen.readBinary(runtimeCache);
      this.runtimeExports = this.options.exportRuntime || ["malloc", "free"];
    } else {
      this.module = new binaryen.Module();
      this.runtimeExports = [];
    }

    this.usizeType = this.target === CompilerTarget.WASM64 ? Type.usize64 : Type.usize32;
    this.memory = new Memory(this, 32); // NULL + HEAP + MSPACE + GC, each aligned to 8 bytes

    const sourceFiles = program.getSourceFiles();
    for (let i = sourceFiles.length - 1; i >= 0; --i) {

      // the first declaration file is assumed to be the library file
      if (sourceFiles[i].isDeclarationFile)
          this.libraryFile = sourceFiles[i];

      // the last non-declaration file is assumed to be the entry file
      else if (!this.entryFile)
        this.entryFile = sourceFiles[i];
    }
  }

  /** Reports a diagnostic message (adds it to {@link Compiler#diagnostics}) and prints it. */
  report(node: ts.Node, message: ts.DiagnosticMessage, arg0?: string | number, arg1?: string | number, arg2?: string | number) {
    const diagnostic = ts.createDiagnosticForNode(node, message, arg0, arg1, arg2);
    this.diagnostics.add(diagnostic);
    if (!(this.options && this.options.silent))
      ts.printDiagnostic(diagnostic);
  }

  /** Mangles a global name (of a function, a class, ...) for use with binaryen. */
  mangleGlobalName(name: string, sourceFile: ts.SourceFile) {
    if (sourceFile === this.libraryFile)
      name = LIB_PREFIX + name;
    else if (/^std\//.test(sourceFile.fileName))
      name = STD_PREFIX + name;
    else if (sourceFile !== this.entryFile)
      name = nodePath.relative(nodePath.dirname(this.entryFile.fileName), sourceFile.fileName)
      .replace(/\\/g, "/")
      .replace(/[^a-zA-Z0-9\.\/$]/g, "") + "/" + name;
    return name;
  }

  /** Scans over the sources and initializes the reflection structure. */
  initialize(): void {
    const sourceFiles = this.program.getSourceFiles();

    for (let i = 0, k = sourceFiles.length, file; i < k; ++i) {
      file = sourceFiles[i];

      for (let j = 0, l = file.statements.length, statement; j < l; ++j) {
        switch ((statement = file.statements[j]).kind) {

          case ts.SyntaxKind.EndOfFileToken:
          case ts.SyntaxKind.InterfaceDeclaration:
          case ts.SyntaxKind.TypeAliasDeclaration:
          case ts.SyntaxKind.ImportDeclaration:
            break; // already handled by TypeScript

          case ts.SyntaxKind.VariableStatement:
            this.initializeGlobal(<ts.VariableStatement>statement);
            break;

          case ts.SyntaxKind.FunctionDeclaration:
            this.initializeFunction(<ts.FunctionDeclaration>statement);
            break;

          case ts.SyntaxKind.ClassDeclaration:
            this.initializeClass(<ts.ClassDeclaration>statement);
            break;

          case ts.SyntaxKind.EnumDeclaration:
            this.initializeEnum(<ts.EnumDeclaration>statement);
            break;

          case ts.SyntaxKind.ModuleDeclaration:
            // TODO: namespaces

          default:
            if (!ts.isDeclaration(statement))
              this.startFunctionBody.push(statement);
            else
              this.report(statement, ts.DiagnosticsEx.Unsupported_node_kind_0_in_1, statement.kind, "Compiler#initialize");
            break;
        }
      }
    }

    if (!this.options.noRuntime)
      this.initializeRuntime();
  }

  /** Gets an existing signature if it exists and otherwise creates it. */
  getOrAddSignature(argumentTypes: Type[], returnType: Type): binaryen.Signature {
    const identifiers: string[] = [];
    argumentTypes.forEach(type => identifiers.push(this.identifierOf(type)));
    identifiers.push(this.identifierOf(returnType));
    const identifier = identifiers.join("");
    let signature = this.signatures[identifier];
    if (!signature) {
      const binaryenArgumentTypes: binaryen.Type[] = argumentTypes.map(type => this.typeOf(type));
      const binaryenReturnType = this.typeOf(returnType);
      signature = this.signatures[identifier] = this.module.getFunctionTypeBySignature(binaryenReturnType, binaryenArgumentTypes)
                                             || this.module.addFunctionType(identifier, binaryenReturnType, binaryenArgumentTypes);
    }
    return signature;
  }

  /** Initializes the statically linked or imported runtime. */
  initializeRuntime(): void {
    if (this.options.noRuntime)
      return;

    // set up exports
    builtins.runtimeNames.forEach(fname => {
      if (this.runtimeExports.indexOf(fname) < 0)
        this.module.removeExport(fname); // does not throw if not existent
    });
  }

  /** Initializes a global variable. */
  initializeGlobal(node: ts.VariableStatement): void {
    for (let i = 0, k = node.declarationList.declarations.length; i < k; ++i) {
      const declaration = node.declarationList.declarations[i];
      const initializerNode = declaration.initializer;

      if (declaration.type) {

        if (!declaration.symbol)
          throw Error("symbol expected");

        const name = this.mangleGlobalName(ts.getNameOfSymbol(declaration.symbol), ts.getSourceFileOfNode(declaration));
        const type = this.resolveType(declaration.type);

        if (type)
          this.addGlobal(name, type, !util.isConst(node.declarationList), initializerNode);
        // otherwise reported by resolveType

      } else
        this.report(declaration.name, ts.DiagnosticsEx.Type_expected);
    }
  }

  /** Adds a global variable. */
  addGlobal(name: string, type: Type, mutable: boolean, initializerNode?: ts.Expression): void {
    const op = this.module;

    const global = new Variable(this, name, type, mutable);
    if (initializerNode) {
      let arrayValues: Array<number | Long | string | null> | null;

      // numeric literals become globals right away
      if (initializerNode.kind === ts.SyntaxKind.NumericLiteral || (initializerNode.kind === ts.SyntaxKind.PrefixUnaryExpression) && (<ts.PrefixUnaryExpression>initializerNode).operator === ts.SyntaxKind.MinusToken && (<ts.PrefixUnaryExpression>initializerNode).operand.kind === ts.SyntaxKind.NumericLiteral) {
        if (global.isConstant) {
          let initializer = initializerNode;
          let negate = false;
          if (initializer.kind === ts.SyntaxKind.PrefixUnaryExpression) {
            negate = true;
            initializer = (<ts.PrefixUnaryExpression>initializer).operand;
          }
          const parsed = tryParseLiteral(<ts.LiteralExpression>initializer, type, negate);
          if (parsed !== null) { // inline
            global.constantValue = <number | Long>parsed;
            return;
          }
        }
        op.addGlobal(name, this.typeOf(type), mutable, expressions.compileLiteral(this, <ts.LiteralExpression>initializerNode, type));

      // constant numeric array literals and initializers go to memory
      } else if (
        !mutable &&
        type.isArray &&
        (
          initializerNode.kind === ts.SyntaxKind.ArrayLiteralExpression &&
          (arrayValues = tryParseArrayLiteral(<ts.ArrayLiteralExpression>initializerNode, type)) !== null
        ) || (
          initializerNode.kind === ts.SyntaxKind.NewExpression &&
          (arrayValues = arrayHelper.evaluateNumericArrayInitializer(<ts.NewExpression>initializerNode, (<Class>type.underlyingClass).typeArgumentsMap.T.type)) !== null
        )
      ) {
        const segment = this.memory.createArray(arrayValues, (<Class>type.underlyingClass).typeArgumentsMap.T.type);
        op.addGlobal(name, this.typeOf(type), false, this.valueOf(this.usizeType, segment.offset));

      // constant string literals and initializers go to memory as well (and are not reused)
      } else if (
        !mutable &&
        type.isString &&
        (
          initializerNode.kind === ts.SyntaxKind.StringLiteral &&
          (arrayValues = arrayHelper.evaluateStringLiteralAsArray(<ts.StringLiteral>initializerNode)) !== null
        ) || (
          initializerNode.kind === ts.SyntaxKind.NewExpression &&
          (arrayValues = arrayHelper.evaluateStringInitializerAsArray(<ts.NewExpression>initializerNode)) !== null
        )
      ) {
        const segment = this.memory.createArray(arrayValues, (<Class>type.underlyingClass).typeArgumentsMap.T.type);
        op.addGlobal(name, this.typeOf(type), false, this.valueOf(this.usizeType, segment.offset));

      // mutables (and everything else) become zeroed globals with a start function initializer
      } else {
        if (!mutable)
          this.report(initializerNode, ts.DiagnosticsEx.Compiling_global_with_unsupported_constant_initializer_expression_as_mutable);

        op.addGlobal(name, this.typeOf(type), true, this.valueOf(type, 0));

        if (!this.startFunction)
          this.startFunction = createStartFunction(this);

        const previousFunction = this.currentFunction;
        this.currentFunction = this.startFunction;

        this.globalInitializers.push(
          op.setGlobal(name, this.compileExpression(initializerNode, type, type, false))
        );

        this.currentFunction = previousFunction;
      }

    } else {

      let value = 0;

      // handle built-ins
      if (builtins.globals.hasOwnProperty(name))
        value = builtins.globals[name];

      // inline if constant
      if (global.isConstant) {
        global.constantValue = value;
        return;
      }

      op.addGlobal(name, this.typeOf(type), mutable, this.valueOf(type, value));
    }
  }

  /** Initializes a top-level function. */
  initializeFunction(node: ts.FunctionDeclaration): FunctionHandle {

    if (node.parent && node.parent.kind === ts.SyntaxKind.ClassDeclaration)
      throw Error("not a top-level function");

    // determine the function's global name
    const name = this.mangleGlobalName(
      ts.getTextOfNode(<ts.Identifier>node.name),
      ts.getSourceFileOfNode(node)
    );

    // obtain or create the template
    let template = this.functionTemplates[name];
    if (!template)
      template = new FunctionTemplate(this, name, node);

    // instantiate it if applicable
    let instance: Function | undefined;
    if (template.isGeneric) {
      // special case: generic builtins evaluate type parameters dynamically and have a known return type
      if (builtins.isBuiltinFunction(name, false))
        instance = new Function(this, name, template, [], {}, [], this.resolveType(<ts.TypeNode>template.declaration.type, true) || Type.void);
    } else
      instance = template.resolve([]);

    return { template, instance };
  }

  /** Initializes a class. */
  initializeClass(node: ts.ClassDeclaration): ClassHandle {

    // determine the class's global name
    const sourceFile = ts.getSourceFileOfNode(node);
    const simpleName = ts.getTextOfNode(<ts.Identifier>node.name);
    const name = this.mangleGlobalName(simpleName, sourceFile);

    // check if it is already initialized
    let template = this.classTemplates[name];
    if (template) {
      if (template.declaration !== node)
        throw Error("duplicate global name: " + name);
      return {
        template: template,
        instance: util.getReflectedClass(template.declaration)
      };
    }

    // handle inheritance
    let base: ClassTemplate | undefined;
    let baseTypeArguments: ts.NodeArray<ts.TypeNode> | ts.TypeNode[] | undefined;
    if (node.heritageClauses) {
      for (let i = 0, k = node.heritageClauses.length; i < k; ++i) {
        const clause = node.heritageClauses[i];
        if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
          if (clause.types.length !== 1)
            throw Error("expected exactly one extended class");
          const extendsNode = clause.types[0];
          if (extendsNode.expression.kind === ts.SyntaxKind.Identifier) {
            const reference = this.resolveReference(<ts.Identifier>extendsNode.expression, ReflectionObjectKind.ClassTemplate);
            if (reference instanceof ClassTemplate) {
              base = reference;
              baseTypeArguments = extendsNode.typeArguments || [];
            } else
              this.report(extendsNode.expression, ts.DiagnosticsEx.Unresolvable_type_0, ts.getTextOfNode(extendsNode.expression));
          } else
            this.report(extendsNode.expression, ts.DiagnosticsEx.Unsupported_node_kind_0_in_1, extendsNode.expression.kind, "Compiler#initializeClass/1");
        } else if (clause.token === ts.SyntaxKind.ImplementsKeyword) {
          // TODO
        } else
          this.report(clause, ts.DiagnosticsEx.Unsupported_node_kind_0_in_1, clause.token, "Compiler#initializeClass/2");
      }
    }

    // create the template and instantiate it if applicable
    template = new ClassTemplate(this, name, node, base, baseTypeArguments);
    let instance: Class | undefined;
    if (!template.isGeneric)
      instance = template.resolve([]);

    // remember standard library declarations that need to be implemented
    if (sourceFile === this.libraryFile)
      this.pendingImplementations[simpleName] = template;

    // respectively replace the declaration with the implementation later on
    else if (this.pendingImplementations[simpleName])
      patchClassImplementation(this.pendingImplementations[simpleName], template);

    return { template, instance };
  }

  /** Initializes a static method. */
  initializeStaticMethod(node: ts.MethodDeclaration | ts.GetAccessorDeclaration | ts.SetAccessorDeclaration): FunctionHandle {

    if (!node.parent || node.parent.kind !== ts.SyntaxKind.ClassDeclaration)
      throw Error("missing parent");
    if (!util.isStatic(node))
      throw Error("not a static method");

    // determine the method's global name
    const name = this.mangleGlobalName(
      ts.getTextOfNode(<ts.Identifier>(<ts.ClassDeclaration>node.parent).name) + "." + ts.getTextOfNode(<ts.Identifier>node.name),
      ts.getSourceFileOfNode(node)
    );

    // obtain or create the template
    let template = this.functionTemplates[name];
    if (!template)
      template = new FunctionTemplate(this, name, node/*, parent is irrelevant here */);

    // instantiate it if applicable
    let instance: Function | undefined;
    if (!template.isGeneric)
      instance = template.resolve([]);

    return { template, instance };
  }

  /** Initializes an instance method. */
  initializeInstanceMethod(node: ts.MethodDeclaration | ts.GetAccessorDeclaration | ts.SetAccessorDeclaration | ts.ConstructorDeclaration, parent: Class): FunctionHandle {

    if (!node.parent || node.parent.kind !== ts.SyntaxKind.ClassDeclaration)
      throw Error("missing parent");
    if (util.isStatic(node))
      throw Error("not an instance method");

    // determine the method's global name
    let name: string;
    let prefix = "";

    if (node.kind === ts.SyntaxKind.GetAccessor)
      prefix = "get_";
    else if (node.kind === ts.SyntaxKind.SetAccessor)
      prefix = "set_";

    // constructors just use the class's name
    if (node.kind === ts.SyntaxKind.Constructor)
      name = parent.name;

    // instance functions are separated with a hash
    else
      name = parent.name + "#" + prefix + ts.getTextOfNode(<ts.Identifier>node.name);

    // obtain or create the template
    let template = this.functionTemplates[name];
    if (!template)
      template = new FunctionTemplate(this, name, node, parent);

    // instantiate it if applicable
    let instance: Function | undefined;
    if (!template.isGeneric)
      instance = template.resolve([]);

    return { template, instance };
  }

  /** Initializes an enum. */
  initializeEnum(node: ts.EnumDeclaration): Enum {

    // determine the enum's global name
    const name = this.mangleGlobalName(ts.getTextOfNode(node.name), ts.getSourceFileOfNode(node));

    // check if it is already initialized
    if (this.enums[name])
      return this.enums[name];

    // enums cannot be exported yet (only functions are supported)
    if (ts.getSourceFileOfNode(node) === this.entryFile && util.isExport(node))
      this.report(node.name, ts.DiagnosticsEx.Unsupported_modifier_0, "export");

    // create the instance
    return new Enum(this, name, node); // registers as a side-effect
  }

  /** Compiles the module and its components. */
  compile(): void {

    const sourceFiles = this.program.getSourceFiles();
    for (let i = 0, k = sourceFiles.length; i < k; ++i) {

      if (sourceFiles[i].isDeclarationFile)
        continue;

      for (const statement of sourceFiles[i].statements) {

        if (!this.options.noTreeShaking)
          if (!(util.isExport(statement) && ts.getSourceFileOfNode(statement) === this.entryFile))
            continue;

        switch (statement.kind) {

          case ts.SyntaxKind.FunctionDeclaration:
          {
            const declaration = <ts.FunctionDeclaration>statement;
            const instance = util.getReflectedFunction(declaration);
            if (instance && !instance.compiled) // otherwise generic: compiled once type arguments are known
              this.compileFunction(instance);
            break;
          }

          case ts.SyntaxKind.ClassDeclaration:
          {
            const declaration = <ts.ClassDeclaration>statement;
            const instance = util.getReflectedClass(declaration);
            if (instance) // otherwise generic: compiled once type arguments are known
              this.compileClass(instance);
            break;
          }

          // otherwise already handled or reported by initialize
        }
      }
    }

    // setup static memory
    const binaryenSegments: binaryen.MemorySegment[] = [];
    this.memory.segments.forEach(segment => {
      binaryenSegments.push({
        offset: this.valueOf(this.usizeType, segment.offset),
        data: segment.buffer
      });
    });

    // initialize runtime heap pointer
    const heapOffset = this.memory.align();
    if (!this.options.noRuntime) {
      const buffer = new Uint8Array(8);
      util.writeLong(buffer, 0, heapOffset);
      binaryenSegments.unshift({
        offset: this.valueOf(this.usizeType, 8),
        data: buffer
      });
    }

    const initialSize = Math.floor((heapOffset.sub(1).toNumber()) / 65536) + 1;
    this.module.setMemory(initialSize, 0xffff, this.options.noRuntime ? "memory" :  undefined, binaryenSegments);

    // compile start function (initializes malloc mspaces)
    this.maybeCompileStartFunction();
  }

  /** Compiles the start function if either a user-provided start function is or global initializes are present. */
  maybeCompileStartFunction(): void {

    if (this.globalInitializers.length === 0 && this.startFunctionBody.length === 0 && this.options.noRuntime)
      return;

    const op = this.module;

    // create a blank start function if there isn't one already
    if (!this.startFunction)
      this.startFunction = createStartFunction(this);
    const previousFunction = this.currentFunction;
    this.currentFunction = this.startFunction;

    const body: binaryen.Statement[] = [];

    // call init first if the runtime is bundled
    if (!this.options.noRuntime)
      body.push(
        op.call(".init", [], binaryen.none)
      );

    // include global initializes
    let i = 0;
    for (const k = this.globalInitializers.length; i < k; ++i)
      body.push(this.globalInitializers[i]); // usually a setGlobal

    // compile top-level statements
    for (i = 0; i < this.startFunctionBody.length; ++i) {
      const compiled = statements.compile(this, this.startFunctionBody[i]);
      if (compiled)
        body.push(compiled);
    }

    // make sure to check for additional locals
    const additionalLocals: binaryen.Type[] = [];
    for (i = 0; i < this.startFunction.locals.length; ++i)
      if (!this.startFunction.locals[i].isInlined)
        additionalLocals.push(this.typeOf(this.startFunction.locals[i].type));

    // and finally add the function
    const startSignature = this.getOrAddSignature([], Type.void);
    this.module.setStart(
      this.module.addFunction(this.startFunction.name, startSignature, additionalLocals, op.block("", body))
    );

    this.currentFunction = previousFunction;
  }

  /** Compiles a malloc invocation using the specified byte size. */
  compileMallocInvocation(size: number, clearMemory: boolean = true): binaryen.Expression {
    const op = this.module;

    const mallocFunction = this.functions[LIB_PREFIX + "malloc"];
    const memsetFunction = this.functions[LIB_PREFIX + "memset"];

    // Simplify if possible but always obtain a pointer for consistency
    if (size === 0 || !clearMemory)
      return mallocFunction.call([ this.valueOf(this.usizeType, size) ]);

    return memsetFunction.call([
      mallocFunction.call([
        this.valueOf(this.usizeType, size)
      ]),
      op.i32.const(0), // 2nd memset argument is int
      this.valueOf(this.usizeType, size)
    ]);
  }

  /** Compiles a function. */
  compileFunction(instance: Function): binaryen.Function | null {
    const op = this.module;

    if (instance.compiled)
      throw Error("duplicate compilation of function " + instance);

    // register signature
    if (!instance.binaryenSignature)
      instance.binaryenSignature = this.signatureOf(instance);
    instance.compiled = true;

    // handle imports
    if (instance.isImport) {
      if (instance.imported)
        throw Error("duplicate compilation of imported function " + instance);

      const sourceFile = ts.getSourceFileOfNode(instance.declaration);
      let pos: number;

      let importModuleName: string;
      let importFunctionName = instance.simpleName;

      if (builtins.isLibraryFile(sourceFile))
        importModuleName = "lib";
      else if (builtins.isStandardFile(sourceFile))
        importModuleName = "std";
      else if ((pos = importFunctionName.indexOf("$")) > -1) {
        importModuleName = importFunctionName.substring(0, pos);
        importFunctionName = importFunctionName.substring(pos + 1);
      } else
        importModuleName = "env";

      this.module.addImport(instance.name, importModuleName, importFunctionName, instance.binaryenSignature);
      instance.imported = true;
      return null;
    }

    // handle statically linked runtime functions
    if (builtins.isRuntimeFunction(instance.name))
      return null;

    // otherwise compile
    if (!instance.body)
      throw Error("cannot compile a non-import function without a body: " + instance.name);

    const body: binaryen.Statement[] = [];
    const previousFunction = this.currentFunction;
    this.currentFunction = instance;
    const initialLocalsLength = instance.locals.length;

    for (let i = /* skip this */ 1; i < instance.parameters.length; ++i) {
      const param = instance.parameters[i];
      if (param.isAlsoProperty) {
        const property = (<Class>instance.parent).properties[param.name];
        if (property)
          body.push(
            compileStore(this, /* solely used for diagnostics anyway */ <ts.Expression>param.node, property.type, op.getLocal(0, this.typeOf(this.usizeType)), property.offset, op.getLocal(i, this.typeOf(param.type)))
          );
        else
          throw Error("missing parameter property");
      }
    }

    if (instance.body.kind === ts.SyntaxKind.Block) {
      const blockNode = <ts.Block>instance.body;
      for (let i = 0, k = blockNode.statements.length; i < k; ++i) {
        const compiled = statements.compile(this, blockNode.statements[i]);
        if (compiled)
          body.push(compiled);
      }
    } else {
      const expressionNode = <ts.Expression>instance.body;
      body.push(op.return(
        this.compileExpression(expressionNode, instance.returnType)
      ));
    }

    const binaryenPtrType = this.typeOf(this.usizeType);

    if (instance.isConstructor && (<Class>instance.parent).implicitMalloc) {

      // constructors implicitly return 'this' if implicit malloc is enabled
      body.push(
        op.return(
          op.getLocal(0, binaryenPtrType)
        )
      );

      // initialize instance properties
      const properties = (<Class>instance.parent).properties;
      let bodyIndex = 0;
      Object.keys(properties).forEach(key => {
        const property = properties[key];
        if (property.isInstance && property.initializer) {
          body.splice(bodyIndex++, 0,
            compileStore(this, property.initializer, property.type,
              op.getLocal(0, binaryenPtrType), property.offset,
              this.compileExpression(property.initializer, property.type, property.type, false)
            )
          );
        }
      });

    } // TODO: what to do with instance property initializers with explicit malloc? set afterwards, using the ctor's return value?

    const additionalLocals: binaryen.Type[] = [];
    for (let i = initialLocalsLength; i < instance.locals.length; ++i) {
      const local = instance.locals[i];
      if (!local.isInlined)
        additionalLocals.push(this.typeOf(local.type));
    }
    const binaryenFunction = instance.binaryenFunction = this.module.addFunction(instance.name, instance.binaryenSignature, additionalLocals, op.block("", body));

    if (instance.isExport)
      this.module.addExport(instance.name, instance.name);

    this.currentFunction = previousFunction;
    return binaryenFunction;
  }

  /** Compiles a class. */
  compileClass(instance: Class): void {
    for (let i = 0, k = instance.declaration.members.length; i < k; ++i) {
      const member = instance.declaration.members[i];
      switch (member.kind) {

        case ts.SyntaxKind.Constructor:
        case ts.SyntaxKind.MethodDeclaration:
        {
          const methodDeclaration = <ts.ConstructorDeclaration | ts.MethodDeclaration>member;
          if (util.isExport(methodDeclaration, true) || this.options.noTreeShaking) {
            const functionInstance = util.getReflectedFunction(methodDeclaration);
            if (functionInstance && !functionInstance.compiled) // otherwise generic: compiled once type arguments are known
              this.compileFunction(functionInstance);
          }
          break;
        }

        // otherwise already reported by initialize
      }
    }
  }

  /** Amends the current break context when entering a loop, switch or similar. */
  enterBreakContext(): string {
    if (this.currentFunction.breakDepth === 0)
      ++this.currentFunction.breakNumber;
    ++this.currentFunction.breakDepth;
    return this.currentFunction.breakLabel;
  }

  /** Amends the current break context when leaving a loop, switch or similar. */
  leaveBreakContext(): void {
    if (this.currentFunction.breakDepth < 1)
      throw Error("unbalanced break context");
    --this.currentFunction.breakDepth;
  }

  /** Textual break label according to the current break context state. */
  get currentBreakLabel(): string { return this.currentFunction.breakLabel; }

  /** Compiles a statement. */
  compileStatement(node: ts.Statement): binaryen.Statement | null {
    return statements.compile(this, node);
  }

  /** Compiles an expression. */
  compileExpression(node: ts.Expression, contextualType: Type, convertToType?: Type, convertExplicit: boolean = false): binaryen.Expression {
    let expr = expressions.compile(this, node, contextualType);
    if (convertToType)
      expr = this.maybeConvertValue(node, expr, util.getReflectedType(node), convertToType, convertExplicit);
    return expr;
  }

  /** Wraps an expression with a conversion where necessary. */
  maybeConvertValue(node: ts.Expression, expr: binaryen.Expression, fromType: Type, toType: Type, explicit: boolean): binaryen.Expression {
    const compiler = this;
    const op = this.module;

    function illegalImplicitConversion() {
      compiler.report(node, ts.DiagnosticsEx.Conversion_from_0_to_1_requires_an_explicit_cast, fromType.toString(), toType.toString());
      explicit = true; // report this only once for the topmost node
    }

    // no conversion required
    if (fromType.kind === toType.kind) {

      if (fromType.kind === TypeKind.usize && fromType.underlyingClass !== toType.underlyingClass)
        compiler.report(node, ts.DiagnosticsEx.Types_0_and_1_are_incompatible, toType.underlyingClass ? toType.underlyingClass.toString() : "usize", fromType.underlyingClass ? fromType.underlyingClass.toString() : "usize");

      return expr;
    }

    // possibly disallowed implicit conversion
    if (!explicit && this.options.noImplicitConversion)
      illegalImplicitConversion();

    if (!explicit) {

      if (
        (this.usizeSize === 4 && fromType.kind === TypeKind.usize && toType.isInt) ||
        (this.usizeSize === 8 && fromType.isLong && toType.kind === TypeKind.usize)
      )
        this.report(node, ts.DiagnosticsEx.Conversion_from_0_to_1_will_fail_when_switching_between_WASM32_64, fromType.toString(), toType.toString());
    }

    util.setReflectedType(node, toType);

    if (fromType === Type.f32) {

      if (!explicit && toType !== Type.f64)
        illegalImplicitConversion();

      switch (toType) {

        case Type.u8:
        case Type.u16:
        case Type.u32:
        case Type.usize32:
        case Type.bool:
          return this.maybeConvertValue(node, op.i32.trunc_u.f32(expr), Type.i32, toType, explicit);

        case Type.i8:
        case Type.i16:
        case Type.i32:
          return this.maybeConvertValue(node, op.i32.trunc_s.f32(expr), Type.i32, toType, explicit);

        case Type.usize64:
        case Type.u64:
          return op.i64.trunc_u.f32(expr);

        case Type.i64:
          return op.i64.trunc_s.f32(expr);

        // floatType == floatType

        case Type.f64:
          return op.f64.promote(expr);

      }

    } else if (fromType === Type.f64) {

      if (!explicit) illegalImplicitConversion();

      switch (toType) {

        case Type.u8:
        case Type.u16:
        case Type.u32:
        case Type.usize32:
        case Type.bool:
          return this.maybeConvertValue(node, op.i32.trunc_u.f64(expr), Type.i32, toType, explicit); // maybe mask

        case Type.i8:
        case Type.i16:
        case Type.i32:
          return this.maybeConvertValue(node, op.i32.trunc_s.f64(expr), Type.i32, toType, explicit); // maybe sign extend

        case Type.u64:
        case Type.usize64:
          return op.i64.trunc_u.f64(expr);

        case Type.i64:
          return op.i64.trunc_s.f64(expr);

        case Type.f32:
          return op.f32.demote(expr);

        // doubleType == doubleType

      }

    } else if (toType === Type.f32) { // int to float

      switch (fromType) {

        case Type.u32:
        case Type.usize32:
          if (!explicit) illegalImplicitConversion();

        case Type.u8:
        case Type.u16:
        case Type.bool:
          return op.f32.convert_u.i32(expr);

        case Type.i32:
          if (!explicit) illegalImplicitConversion();

        case Type.i8:
        case Type.i16:
          return op.f32.convert_s.i32(expr);

        case Type.u64:
        case Type.usize64:
          if (!explicit) illegalImplicitConversion();
          return op.f32.convert_u.i64(expr);

        case Type.i64:
          if (!explicit) illegalImplicitConversion();
          return op.f32.convert_s.i64(expr);

      }

    } else if (toType === Type.f64) { // int to double

      switch (fromType) {

        case Type.u32:
        case Type.usize32:
        case Type.u8:
        case Type.u16:
        case Type.bool:
          return op.f64.convert_u.i32(expr);

        case Type.i32:
        case Type.i8:
        case Type.i16:
          return op.f64.convert_s.i32(expr);

        case Type.u64:
        case Type.usize64:
          if (!explicit) illegalImplicitConversion();
          return op.f64.convert_u.i64(expr);

        case Type.i64:
          if (!explicit) illegalImplicitConversion();
          return op.f64.convert_s.i64(expr);

      }

    } else if (fromType.isInt && toType.isLong) {

      if (toType.isSigned)
        return op.i64.extend_s(expr);
      else
        return op.i64.extend_u(expr);

    } else if (fromType.isLong && toType.isInt) {

      if (!explicit) illegalImplicitConversion();

      expr = op.i32.wrap(expr);
      fromType = fromType.isSigned ? Type.i32 : Type.u32;

      // fallthrough
    }

    // int to other int

    if (fromType.size <= toType.size || toType.isInt)
      return expr;

    if (!explicit) illegalImplicitConversion();

    if (toType.isSigned) { // sign-extend

      const shift = toType === Type.i8 ? 24 : 16;
      return op.i32.shr_s(
        op.i32.shl(
          expr,
          op.i32.const(shift)
        ),
        op.i32.const(shift)
      );

    } else { // mask

      const mask = toType === Type.u8 ? 0xff : 0xffff;
      return op.i32.and(
        expr,
        op.i32.const(mask)
      );

    }
  }

  /** Resolves a TypeScript type alias to the root AssemblyScript type where applicable, by symbol. */
  maybeResolveAlias(symbol: ts.Symbol): ts.Symbol {

    // Exit early (before hitting 'number') if it's a built in type
    switch (ts.getNameOfSymbol(symbol)) {
      case "i8":
      case "u8":
      case "i16":
      case "u16":
      case "i32":
      case "u32":
      case "i64":
      case "u64":
      case "f32":
      case "f64":
      case "bool":
      case "usize":
      case "string":
        return symbol;
    }

    // Otherwise follow any aliases to the original type
    if (symbol.declarations)
      for (let i = 0, k = symbol.declarations.length; i < k; ++i) {
        const declaration = symbol.declarations[i];
        if (declaration.kind === ts.SyntaxKind.TypeAliasDeclaration) {
          const aliasDeclaration = <ts.TypeAliasDeclaration>declaration;
          if (aliasDeclaration.type.kind === ts.SyntaxKind.TypeReference) {
            const symbolAtLocation = this.checker.getSymbolAtLocation((<ts.TypeReferenceNode>aliasDeclaration.type).typeName);
            if (symbolAtLocation)
              return this.maybeResolveAlias(symbolAtLocation);
          }
        }
      }

    return symbol;
  }

  /** Resolves a TypeScript type to a AssemblyScript type. */
  resolveType(type: ts.TypeNode, acceptVoid: boolean = false, typeArgumentsMap?: TypeArgumentsMap): Type | null {

    // only supported union type is `something | null`, representing a nullable that must reference a class
    if (type.kind === ts.SyntaxKind.UnionType && (<ts.UnionTypeNode>type).types.length === 2 && ts.getTextOfNode((<ts.UnionTypeNode>type).types[1]) === "null") {
      const nonNullable = this.resolveType((<ts.UnionTypeNode>type).types[0], false, typeArgumentsMap);
      if (nonNullable)
        return nonNullable.asNullable();
    }

    switch (type.kind) {

      case ts.SyntaxKind.VoidKeyword:
        if (!acceptVoid)
          this.report(type, ts.DiagnosticsEx.Type_0_is_invalid_in_this_context, "void");
        return Type.void;

      case ts.SyntaxKind.BooleanKeyword:
        this.report(type, ts.DiagnosticsEx.Assuming_0_instead_of_1, "bool", "boolean");
        return Type.bool;

      case ts.SyntaxKind.NumberKeyword:
        this.report(type, ts.DiagnosticsEx.Assuming_0_instead_of_1, "f64", "number");
        return Type.f64;

      case ts.SyntaxKind.ThisKeyword:
      case ts.SyntaxKind.ThisType:
        if (this.currentFunction && this.currentFunction.parent)
          return this.currentFunction.parent.type;
        // fallthrough

      case ts.SyntaxKind.TypeReference:
      {
        const typeName = ts.getTextOfNode(type);
        if (typeArgumentsMap && typeArgumentsMap[typeName])
          return typeArgumentsMap[typeName].type;

        const referenceNode = <ts.TypeReferenceNode>type;
        const symbolAtLocation = this.checker.getSymbolAtLocation(referenceNode.typeName);
        if (symbolAtLocation) {
          const symbol = this.maybeResolveAlias(symbolAtLocation);
          if (symbol) {

            // Exit early if it's a basic type
            switch (ts.getNameOfSymbol(symbol)) {
              case "i8": return Type.i8;
              case "u8": return Type.u8;
              case "i16": return Type.i16;
              case "u16": return Type.u16;
              case "i32": return Type.i32;
              case "u32": return Type.u32;
              case "i64": return Type.i64;
              case "u64": return Type.u64;
              case "f32": return Type.f32;
              case "f64": return Type.f64;
              case "bool": return Type.bool;
              case "usize": return this.usizeType;
              case "string": return this.classes[LIB_PREFIX + "String"].type;
            }

            const reference = this.resolveReference(referenceNode.typeName, ReflectionObjectKind.ClassTemplate | ReflectionObjectKind.Class);

            if (reference instanceof Class)
              return (<Class>reference).type;

            if (reference instanceof ClassTemplate && referenceNode.typeArguments) {
              const template = <ClassTemplate>reference;
              const instance = template.resolve(referenceNode.typeArguments, typeArgumentsMap);
              return instance.type;
            }
          }
        }
        break;
      }

      case ts.SyntaxKind.StringKeyword: {
        const stringClass = this.classes[LIB_PREFIX + "String"];
        if (!stringClass)
          throw Error("missing string class");
        return stringClass.type;
      }

      case ts.SyntaxKind.ArrayType:
      {
        const arrayTypeNode = <ts.ArrayTypeNode>type;
        const template = this.classTemplates[LIB_PREFIX + "Array"];
        const instance = template.resolve([ arrayTypeNode.elementType ]);
        return instance.type;
      }
    }

    this.report(type, ts.DiagnosticsEx.Unresolvable_type_0, ts.getTextOfNode(type));
    return null;
  }

  /** Resolves an identifier or name to the corresponding reflection object. */
  resolveReference(node: ts.Identifier | ts.EntityName, filter: ReflectionObjectKind = -1): Object | null {

    // Locals including 'this'
    const localName = ts.getTextOfNode(node);
    if (this.currentFunction && this.currentFunction.localsByName[localName])
      return this.currentFunction.localsByName[localName];

    // Globals, enums, functions and classes
    const symbol = this.checker.getSymbolAtLocation(node);
    if (symbol && symbol.declarations) { // Determine declaration site

      for (let i = 0, k = symbol.declarations.length; i < k; ++i) {
        const declaration = symbol.declarations[i];
        const globalName = this.mangleGlobalName(ts.getNameOfSymbol(symbol), ts.getSourceFileOfNode(declaration));

        if (filter & ReflectionObjectKind.Variable && this.globals[globalName])
          return this.globals[globalName];

        if (filter & ReflectionObjectKind.Enum && this.enums[globalName])
          return this.enums[globalName];

        if (filter & ReflectionObjectKind.Function && this.functions[globalName])
          return this.functions[globalName];

        if (filter & ReflectionObjectKind.FunctionTemplate && this.functionTemplates[globalName])
          return this.functionTemplates[globalName];

        if (filter & ReflectionObjectKind.Class && this.classes[globalName])
          return this.classes[globalName];

        if (filter & ReflectionObjectKind.ClassTemplate && this.classTemplates[globalName])
          return this.classTemplates[globalName];
      }
    }
    return null;
  }

  /** Resolves a list of type arguments to a type arguments map. */
  resolveTypeArgumentsMap(typeArguments: ts.NodeArray<ts.TypeNode> | ts.TypeNode[], declaration: ts.FunctionLikeDeclaration | ts.ClassDeclaration, baseTypeArgumentsMap?: TypeArgumentsMap): TypeArgumentsMap {
    const declarationTypeCount = declaration.typeParameters && declaration.typeParameters.length || 0;
    if (typeArguments.length !== declarationTypeCount)
      throw Error("type parameter count mismatch: expected " + declarationTypeCount + " but saw " + typeArguments.length);
    const map: TypeArgumentsMap = baseTypeArgumentsMap && Object.create(baseTypeArgumentsMap) || {};
    for (let i = 0; i < declarationTypeCount; ++i) {
      const name = ts.getTextOfNode((<ts.NodeArray<ts.TypeParameterDeclaration>>declaration.typeParameters)[i].name);
      const node = typeArguments[i];
      const type = baseTypeArgumentsMap && baseTypeArgumentsMap[name] && baseTypeArgumentsMap[name].type || this.resolveType(node, false, baseTypeArgumentsMap) || Type.void; // reports
      map[name] = { node, type };
    }
    return map;
  }

  /** Computes the binaryen signature identifier of a reflected type. */
  identifierOf(type: Type): string {
    switch (type.kind) {

      case TypeKind.i8:
      case TypeKind.u8:
      case TypeKind.i16:
      case TypeKind.u16:
      case TypeKind.i32:
      case TypeKind.u32:
      case TypeKind.bool:
        return "i";

      case TypeKind.i64:
      case TypeKind.u64:
        return "I";

      case TypeKind.f32:
        return "f";

      case TypeKind.f64:
        return "F";

      case TypeKind.usize:
        return this.usizeType === Type.usize32 ? "i" : "I";

      case TypeKind.void:
        return "v";
    }
    throw Error("unexpected type");
  }

  /** Obtains the signature of the specified reflected function. */
  signatureOf(instance: Function): binaryen.Signature {
    let signature = instance.binaryenSignature;
    if (!signature) {
      signature = this.module.getFunctionTypeBySignature(instance.binaryenReturnType, instance.binaryenParameterTypes);
      if (!signature)
        signature = this.module.addFunctionType(instance.binaryenSignatureId, instance.binaryenReturnType, instance.binaryenParameterTypes);
    }
    return signature;
  }

  /** Computes the binaryen type of a reflected type. */
  typeOf(type: Type): binaryen.Type {
    switch (type.kind) {

      case TypeKind.i8:
      case TypeKind.u8:
      case TypeKind.i16:
      case TypeKind.u16:
      case TypeKind.i32:
      case TypeKind.u32:
      case TypeKind.bool:
        return binaryen.i32;

      case TypeKind.i64:
      case TypeKind.u64:
        return binaryen.i64;

      case TypeKind.f32:
        return binaryen.f32;

      case TypeKind.f64:
        return binaryen.f64;

      case TypeKind.usize:
        return this.usizeType === Type.usize32 ? binaryen.i32 : binaryen.i64;

      case TypeKind.void:
        return binaryen.none;
    }
    throw Error("unexpected type");
  }

  /** Computes the binaryen opcode category (i32, i64, f32, f64) of a reflected type. */
  categoryOf(type: Type): binaryen.I32Operations | binaryen.I64Operations | binaryen.F32Operations | binaryen.F64Operations {
    const op = this.module;

    switch (type.kind) {

      case TypeKind.i8:
      case TypeKind.u8:
      case TypeKind.i16:
      case TypeKind.u16:
      case TypeKind.i32:
      case TypeKind.u32:
      case TypeKind.bool:
        return op.i32;

      case TypeKind.i64:
      case TypeKind.u64:
        return op.i64;

      case TypeKind.f32:
        return op.f32;

      case TypeKind.f64:
        return op.f64;

      case TypeKind.usize:
        return this.usizeType === Type.usize32 ? op.i32 : op.i64;
    }
    throw Error("unexpected type");
  }

  /** Computes the constant value binaryen expression of the specified reflected type. */
  valueOf(type: Type, value: number | Long): binaryen.Expression {
    const op = this.module;

    if (type.isLong) {
      const long = Long.fromValue(value);
      return op.i64.const(long.low, long.high);
    } else if (Long.isLong(value))
      value = Long.fromValue(value).toNumber();

    value = <number>value;

    switch (type.kind) {

      case TypeKind.u8:
        return op.i32.const(value & 0xff);

      case TypeKind.i8:
        return op.i32.const((value << 24) >> 24);

      case TypeKind.i16:
        return op.i32.const((value << 16) >> 16);

      case TypeKind.u16:
        return op.i32.const(value & 0xffff);

      case TypeKind.i32:
      case TypeKind.u32:
      case TypeKind.usize: // long already handled
        return op.i32.const(value);

      case TypeKind.bool:
        return op.i32.const(value ? 1 : 0);

      case TypeKind.f32:
        return op.f32.const(value);

      case TypeKind.f64:
        return op.f64.const(value);
    }
    throw Error("unexpected type");
  }

  debugInfo(): string {
    const sb: string[] = [];
    sb.push("--- classes ---\n");
    Object.keys(this.classes).forEach(key => {
      sb.push(key, ": ", this.classes[key].toString(), "\n");
    });
    sb.push("--- class templates ---\n");
    Object.keys(this.classTemplates).forEach(key => {
      sb.push(key, ": ", this.classTemplates[key].toString(), "\n");
    });
    sb.push("--- functions ---\n");
    Object.keys(this.functions).forEach(key => {
      sb.push(key, ": ", this.functions[key].toString(), "\n");
    });
    sb.push("--- function templates ---\n");
    Object.keys(this.functionTemplates).forEach(key => {
      sb.push(key, ": ", this.functionTemplates[key].toString(), "\n");
    });
    return sb.join("");
  }
}

export default Compiler;

/** Creates a new reflected start function. */
function createStartFunction(compiler: Compiler): Function {
  return new Function(compiler, ".start", new FunctionTemplate(compiler, ".start", <ts.FunctionLikeDeclaration>{}), [], {}, [], Type.void);
}
