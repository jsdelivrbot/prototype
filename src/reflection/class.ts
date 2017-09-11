/** @module assemblyscript/reflection */ /** */

import * as ts from "../typescript";
import { Compiler, LIB_PREFIX, STD_PREFIX } from "../compiler";
import { FunctionTemplate, Function } from "./function";
import { ReflectionObject, ReflectionObjectKind } from "./object";
import { Property } from "./property";
import { Type, TypeArgumentsMap } from "./type";
import { getReflectedFunction, setReflectedFunction, setReflectedFunctionTemplate, setReflectedClass, setReflectedClassTemplate, isExport, isStatic, startsWith } from "../util";

/** Common base class of {@link Class} and {@link ClassTemplate}. */
export abstract class ClassBase extends ReflectionObject {

  /** Declaration reference. */
  declaration: ts.ClassDeclaration;

  constructor(kind: ReflectionObjectKind, compiler: Compiler, name: string, declaration: ts.ClassDeclaration) {
    super(kind, compiler, name);
    this.declaration = declaration;
  }

  /** Tests if this class is generic. */
  get isGeneric(): boolean { return !!(this.declaration.typeParameters && this.declaration.typeParameters.length); }

  /** Tests if this class is exported. */
  get isExport(): boolean { return isExport(this.declaration) && ts.getSourceFileOfNode(this.declaration) === this.compiler.entryFile; }

  /** Tests if this class has been annotated with a decorator of the specified name. */
  hasDecorator(name: string): boolean {
    const decorators = this.declaration.decorators;
    if (decorators) {
      for (let i = 0, k = decorators.length; i < k; ++i) {
        const decorator = decorators[i];
        if (
          decorator.expression.kind === ts.SyntaxKind.CallExpression &&
          (<ts.CallExpression>decorator.expression).expression.kind === ts.SyntaxKind.Identifier &&
          ts.getTextOfNode(<ts.Identifier>(<ts.CallExpression>decorator.expression).expression) === name
        )
          return true;
      }
    }
    return false;
  }
}

/** Interface describing a reflected class method. */
export interface ClassMethod {
  /** Class template with possibly unresolved type parameters. */
  template: FunctionTemplate;
  /** Class instance with type parameters resolved, if initialized yet. */
  instance?: Function;
}

/** Tests if the specified global name references a built-in array. */
export function isBuiltinArray(globalName: string) {
  return startsWith(globalName, LIB_PREFIX + "Array<") || startsWith(globalName, STD_PREFIX + "Array<");
}

/** Tests if the specified global name references a built-in string. */
export function isBuiltinString(globalName: string) {
  return globalName === LIB_PREFIX + "String";
}

/** A class handle consisting of its instance, if any, and its template. */
export interface ClassHandle {
  template: ClassTemplate;
  instance?: Class;
}

/** A class instance with generic parameters resolved. */
export class Class extends ClassBase {

  /** Corresponding class template. */
  template: ClassTemplate;
  /** Reflected class type. */
  type: Type;
  /** Concrete type arguments. */
  typeArguments: ts.NodeArray<ts.TypeNode> | ts.TypeNode[];
  /** Type arguments map. */
  typeArgumentsMap: TypeArgumentsMap;
  /** Base class, if any. */
  base?: Class;
  /** Static and instance class properties. */
  properties: { [key: string]: Property } = {};
  /** Static and instance class methods. */
  methods: { [key: string]: ClassMethod } = {};
  /** Getter methods. */
  getters: { [key: string]: ClassMethod } = {};
  /** Setter methods. */
  setters: { [key: string]: ClassMethod } = {};
  /** Class constructor, if any. */
  ctor?: Function;
  /** Size in memory, in bytes. */
  size: number = 0;
  /** Whether array access is supported on this class. */
  isArray: boolean = false;
  /** Whether this is a string-like class. */
  isString: boolean = false;
  /** Whether memory must be allocated implicitly. */
  implicitMalloc: boolean = false;

  /** Constructs a new reflected class and binds it to its TypeScript declaration. */
  constructor(compiler: Compiler, name: string, template: ClassTemplate, typeArguments: ts.NodeArray<ts.TypeNode> | ts.TypeNode[] , base?: Class) {
    super(ReflectionObjectKind.Class, compiler, name, template.declaration);

    // register
    if (compiler.classes[this.name])
      throw Error("duplicate class instance: " + this.name);
    compiler.classes[this.name] = template.instances[this.name] = this;
    if (!this.isGeneric) setReflectedClass(template.declaration, this);

    // initialize
    this.template = template;
    this.type = compiler.usizeType.asClass(this);
    this.typeArguments = typeArguments;
    this.typeArgumentsMap = compiler.resolveTypeArgumentsMap(typeArguments, this.declaration, base && base.typeArgumentsMap);
    this.base = base;

    if (isBuiltinArray(this.name) || (!!this.base && this.base.isArray))
      this.isArray = true;

    if (isBuiltinString(this.name) || (!!this.base && this.base.isString))
      this.isString = true;

    this.implicitMalloc = !this.hasDecorator("no_implicit_malloc");

    // inherit from base class
    if (this.base) {
      this.properties = Object.create(this.base.properties);
      this.size = this.base.size;
      this.methods = Object.create(this.base.methods);
      this.getters = Object.create(this.base.getters);
      this.setters = Object.create(this.base.setters);
    }

    // set up properties - TODO: Investigate impact of dense unaligned properties (that's the case currently)
    Object.keys(this.template.propertyDeclarations).forEach(propertyName => {
      if (this.properties[propertyName])
        return; // inherited from base class and already set up
      const propertyDeclaration = this.template.propertyDeclarations[propertyName];
      if (propertyDeclaration.type) {
        const propertyType = this.compiler.resolveType(propertyDeclaration.type);
        if (propertyType) {
          this.properties[propertyName] = new Property(this.compiler, propertyName, propertyDeclaration, propertyType, this.size);
          if (isStatic(propertyDeclaration))
            this.compiler.addGlobal(this.name + "." + propertyName, propertyType, true, propertyDeclaration.initializer);
          else
            this.size += propertyType.size;
        } // otherwise reported by resolveType
      } else
        this.compiler.report(propertyDeclaration.name, ts.DiagnosticsEx.Type_expected);
    });

    // set up methods
    Object.keys(this.template.methodDeclarations).forEach(methodName => {
      const methodDeclaration = this.template.methodDeclarations[methodName];
      const hasBody = !!methodDeclaration.body;
      if (!hasBody && this.base && this.base.methods[methodName])
        this.methods[methodName] = this.base.methods[methodName];
      else
        this.methods[methodName] = isStatic(methodDeclaration)
          ? this.compiler.initializeStaticMethod(methodDeclaration)
          : this.methods[methodName] = this.compiler.initializeInstanceMethod(methodDeclaration, this);
    });

    // set up getters
    Object.keys(this.template.getterDeclarations).forEach(getterName => {
      const getterDeclaration = this.template.getterDeclarations[getterName];
      this.getters[getterName] = isStatic(getterDeclaration)
        ? this.compiler.initializeStaticMethod(getterDeclaration)
        : this.compiler.initializeInstanceMethod(getterDeclaration, this);
    });

    // set up setters
    Object.keys(this.template.setterDeclarations).forEach(setterName => {
      const setterDeclaration = this.template.setterDeclarations[setterName];
      this.setters[setterName] = isStatic(setterDeclaration)
        ? this.compiler.initializeStaticMethod(setterDeclaration)
        : this.compiler.initializeInstanceMethod(setterDeclaration, this);
    });

    // set up constructor
    const ctorDeclaration = this.template.ctorDeclaration;
    if (ctorDeclaration) {
      const ctor = this.compiler.initializeInstanceMethod(ctorDeclaration, this);
      this.ctor = ctor.instance;
      if (!this.ctor)
        this.ctor = getReflectedFunction(ctorDeclaration);
      if (!this.ctor)
        this.ctor = ctor.template.resolve([], this.typeArgumentsMap);

      for (let j = 0, l = ctorDeclaration.parameters.length; j < l; ++j) {
        const parameterNode = ctorDeclaration.parameters[j];
        if (parameterNode.modifiers && parameterNode.modifiers.length) {
          const propertyName = ts.getTextOfNode(parameterNode.name);
          const parameter = this.ctor.parameters[/* this */ 1 + j];
          if (parameter.name !== propertyName) // ^ make sure this is correct
            throw Error("parameter name mismatch");
          parameter.isAlsoProperty = true;
          if (parameterNode.type) {
            const propertyType = this.compiler.resolveType(parameterNode.type);
            if (propertyType) {
              this.properties[propertyName] = new Property(this.compiler, propertyName, /* FIXME */<ts.PropertyDeclaration><any>parameterNode, propertyType, this.size);
              this.size += propertyType.size;
            } // otherwise reported by resolveType
          } else
            this.compiler.report(parameterNode, ts.DiagnosticsEx.Type_expected);
        }
      }
    }
  }

  /** Tests if this class extends another class. */
  extends(base: Class): boolean {
    let current = this.base;
    while (current) {
      if (current === base)
        return true;
      current = current.base;
    }
    return false;
  }

  /** Tests if this class is assignable to the specified (class) type. */
  isAssignableTo(type: Class): boolean {
    return this === type || this.extends(type);
  }
}

export default Class;

/** A class template with possibly unresolved generic parameters. */
export class ClassTemplate extends ClassBase {

  /** Class instances by global name. */
  instances: { [key: string]: Class } = {};
  /** Base class template, if any. */
  base?: ClassTemplate;
  /** Base type arguments. */
  baseTypeArguments: ts.NodeArray<ts.TypeNode> | ts.TypeNode[];
  /** Static and instance class property declarations by simple name. */
  propertyDeclarations: { [key: string]: ts.PropertyDeclaration } = {};
  /** Static and instance method declarations by simple name. */
  methodDeclarations: { [key: string]: ts.MethodDeclaration; } = {};
  /** Getter declarations by simple name. */
  getterDeclarations: { [key: string]: ts.MethodDeclaration; } = {};
  /** Setter declarations by simple name. */
  setterDeclarations: { [key: string]: ts.MethodDeclaration; } = {};
  /** Constructor declaration, if any. */
  ctorDeclaration?: ts.ConstructorDeclaration;

  /** Constructs a new reflected class template and binds it to its declaration. */
  constructor(compiler: Compiler, name: string, declaration: ts.ClassDeclaration, base?: ClassTemplate, baseTypeArguments?: ts.NodeArray<ts.TypeNode> | ts.TypeNode[]) {
    super(ReflectionObjectKind.ClassTemplate, compiler, name, declaration);

    if (base && !baseTypeArguments)
      throw Error("missing base type arguments"); // handled by typescript

    // register (without appended genertic types)
    if (compiler.classes[this.name])
      throw Error("duplicate class template: " + this.name);
    compiler.classTemplates[this.name] = this;
    setReflectedClassTemplate(this.declaration, this);

    // initialize
    this.base = base;
    this.baseTypeArguments = baseTypeArguments || [];

    // append generic type parameters to internal name
    if (declaration.typeParameters && declaration.typeParameters.length) {
      const typeNames: string[] = new Array(declaration.typeParameters.length);
      for (let i = 0; i < declaration.typeParameters.length; ++i)
        typeNames[i] = ts.getTextOfNode(declaration.typeParameters[i].name);
      this.name += "<" + typeNames.join(",") + ">";
    }

    // populate declarations
    for (let i = 0, k = this.declaration.members.length; i < k; ++i) {
      const member = this.declaration.members[i];
      switch (member.kind) {

        case ts.SyntaxKind.PropertyDeclaration: {
          const propertyDeclaration = <ts.PropertyDeclaration>member;
          const propertyName = ts.getTextOfNode(propertyDeclaration.name);
          if (this.propertyDeclarations[propertyName])
            throw Error("duplicate property declaration '" + propertyName + "' in " + this);
          this.propertyDeclarations[propertyName] = propertyDeclaration;
          break;
        }
        case ts.SyntaxKind.MethodDeclaration: {
          const methodDeclaration = <ts.MethodDeclaration>member;
          const methodName = ts.getTextOfNode(methodDeclaration.name);
          if (this.methodDeclarations[methodName])
            throw Error("duplicate method declaration '" + methodName + "' in " + this);
          this.methodDeclarations[methodName] = methodDeclaration;
          break;
        }
        case ts.SyntaxKind.GetAccessor: {
          const getterDeclaration = <ts.MethodDeclaration>member;
          const getterName = ts.getTextOfNode(getterDeclaration.name);
          if (this.getterDeclarations[getterName])
            throw Error("duplicate getter declaration '" + getterName + "' in " + this);
          this.getterDeclarations[getterName] = getterDeclaration;
          break;
        }
        case ts.SyntaxKind.SetAccessor: {
          const setterDeclaration = <ts.MethodDeclaration>member;
          const setterName = ts.getTextOfNode(setterDeclaration.name);
          if (this.setterDeclarations[setterName])
            throw Error("duplicate setter declaration '" + setterName + "' in " + this);
          this.setterDeclarations[setterName] = setterDeclaration;
          break;
        }
        case ts.SyntaxKind.Constructor: {
          const ctorDeclaration = <ts.ConstructorDeclaration>member;
          if (this.ctorDeclaration)
            throw Error("duplicate constructor declaration in " + this);
          this.ctorDeclaration = ctorDeclaration;
          break;
        }
        case ts.SyntaxKind.SemicolonClassElement: // ignore
          break;
        default:
          this.compiler.report(member, ts.DiagnosticsEx.Unsupported_node_kind_0_in_1, member.kind, "reflection.ClassTemplate#constructor");
      }
    }
  }

  /** Resolves this possibly generic class against the provided type arguments. */
  resolve(typeArgumentNodes: ts.NodeArray<ts.TypeNode> | ts.TypeNode[], typeArgumentsMap?: TypeArgumentsMap): Class {

    // validate number of type parameters
    const typeParametersCount = this.declaration.typeParameters && this.declaration.typeParameters.length || 0;
    if (typeArgumentNodes.length !== typeParametersCount)
      throw Error("type parameter count mismatch: expected "+ typeParametersCount + " but saw " + typeArgumentNodes.length);

    // replace type parameters with their actual types in internal name
    let name = this.name.replace(/<.*$/, "");
    const typeArguments: TypeArgumentsMap = {};
    if (typeParametersCount) {
      const resolvedTypeNames: string[] = new Array(typeParametersCount);
      for (let i = 0; i < typeParametersCount; ++i) {
        const parameter = (<ts.NodeArray<ts.TypeParameterDeclaration>>this.declaration.typeParameters)[i];
        const parameterType = this.compiler.resolveType(typeArgumentNodes[i], false, typeArgumentsMap) || Type.void; // reports
        const parameterName = ts.getTextOfNode(<ts.Identifier>parameter.name);
        typeArguments[parameterName] = {
          type: parameterType,
          node: typeArgumentNodes[i]
        };
        resolvedTypeNames[i] = parameterType.toString();
      }
      name += "<" + resolvedTypeNames.join(",") + ">";
    }

    let instance = this.instances[name];
    if (!instance) {
      // resolve base type arguments against current type arguments
      let base: Class | undefined;
      if (this.base) {
        const baseTypeArgumentNodes: ts.TypeNode[] = [];
        for (let i = 0; i < this.baseTypeArguments.length; ++i) {
          const argument = this.baseTypeArguments[i];
          const argumentName = ts.getTextOfNode(argument);
          baseTypeArgumentNodes[i] = typeArguments[argumentName] ? typeArguments[argumentName].node : argument;
        }
        base = this.base.resolve(baseTypeArgumentNodes);
      }
      instance = new Class(this.compiler, name, this, typeArgumentNodes, base);
    }
    return instance;
  }
}

/** Patches a declaration to inherit from its actual implementation. */
export function patchClassImplementation(declTemplate: ClassTemplate, implTemplate: ClassTemplate): void {
  const compiler = implTemplate.compiler;

  if (compiler !== declTemplate.compiler)
    throw Error("compiler mismatch");

  // Make the declaration extend the implementation. New instances will automatically inherit this change from the template.
  implTemplate.base = declTemplate.base; // overrides inheritance from declaration
  declTemplate.base = implTemplate;
  const declBaseTypeArguments = declTemplate.baseTypeArguments.slice();
  if (implTemplate.declaration.typeParameters) {
    for (let i = 0, k = implTemplate.declaration.typeParameters.length; i < k; ++i) {
      const parameter = implTemplate.declaration.typeParameters[i];
      declBaseTypeArguments.push(<ts.TypeNode><any>parameter); // solely used to obtain a name
    }
  }
  if (declTemplate.baseTypeArguments.length < declBaseTypeArguments.length)
    declTemplate.baseTypeArguments = ts.createNodeArray(declBaseTypeArguments);

  // patch existing instances
  for (let keys = Object.keys(declTemplate.instances), i = 0, k = keys.length; i < k; ++i) {
    const declInstance = declTemplate.instances[keys[i]];
    const implInstance = implTemplate.resolve(Object.keys(declInstance.typeArgumentsMap).map(key => declInstance.typeArgumentsMap[key].node));

    implInstance.base = declInstance.base;
    declInstance.base = implInstance;

    // replace already initialized class instance methods with their actual implementations
    for (let mkeys = Object.keys(declInstance.methods), j = 0, l = mkeys.length; j < l; ++j) {
      const declMethod = declInstance.methods[mkeys[j]];
      const implMethod = implInstance.methods[mkeys[j]];

      if (!implMethod)
        throw Error("missing implementation of '" + mkeys[j] + "' in " + implInstance + " as declared in " + declInstance);

      // the following assumes that methods haven't been compiled yet
      declTemplate.methodDeclarations[mkeys[j]] = implTemplate.methodDeclarations[mkeys[j]];
      declInstance.methods[mkeys[j]] = implMethod;

      setReflectedFunctionTemplate(declMethod.template.declaration, implMethod.template);
      if (implMethod.instance && !implMethod.instance.isGeneric)
        setReflectedFunction(declMethod.template.declaration, implMethod.instance);
    }
  }
}
