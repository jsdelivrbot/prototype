Distributions
=============

This folder contains pre-built bundles of AssemblyScript. Bundles are compatible with CommonJS and AMD loaders and export globally as `assemblyscript` if neither is present.

Note that [binaryen.js](https://github.com/AssemblyScript/binaryen.js) (required) and [wabt.js](https://github.com/AssemblyScript/wabt.js) (optional) are not included in the bundle because these are rather large asm.js compilations. Compatible versions of both dependencies can be obtained from their [respective](https://github.com/AssemblyScript/binaryen.js/tags) [repositories](https://github.com/AssemblyScript/wabt.js/tags).

Usage
-----

Local:

```html
<script src="binaryen.js"></script>
<script src="wabt.js"></script><!-- optional -->
<script src="assemblyscript.js"></script>
```

CDN:

```html
<script src="//rawgit.com/AssemblyScript/binaryen.js/master/index.js"></script>
<script src="//rawgit.com/AssemblyScript/wabt.js/master/index.js"></script><!-- optional -->
<script src="//rawgit.com/AssemblyScript/assemblyscript/master/dist/assemblyscript.js"></script>
```

When using the CDN, remember to replace `master` with the exact versions / tags your application depends upon. In case of doubt, check the `package.json`-file of the AssemblyScript package you are using for the respective versions. If you however insist to use bleeding edge master versions, be prepared that your application might break whenever changes are pushed to master.

Example
-------

```js
const Compiler = assemblyscript.Compiler;

const module = Compiler.compileString(`
export function add(a: int, b: int): int {
  return a + b;
}
`, { silent: true });

if (module) {
  const text = module.emitText();
  const wasm = module.emitBinary();
  ...
} else
  throw Error("compilation failed"); // or inspect Compiler.lastDiagnostics
...
```
