// Packages necessary library files for in-browser usage.

var fs = require("fs");

var out = [
  "/**",
  " * Bundled library components for in-browser usage.",
  " * @module assemblyscript/library",
  " */",
  ""
];
out.push(
  "/** AssemblyScript version. */",
  "export const version: string = " + JSON.stringify(require("../package.json").version) + ";",
  ""
);

var files = {};
[
  "assembly.d.ts", // must be first
  "std/disposable.ts",
  "std/array.ts",
  "std/string.ts",
  "std/console.ts",
].forEach(file => {
  files[file] = fs.readFileSync(__dirname + "/../" + file).toString().replace(/\r?\n/g, "\n");
});
out.push(
  "/** Library sources for in-browser usage. */",
  "export const files: { [key: string]: string } = " + JSON.stringify(files, null, 2) + ";",
  ""
);

var runtimeBlob;
try {
  runtimeBlob = fs.readFileSync(__dirname + "/../lib/runtime/dist/runtime.wasm").toString("base64");
} catch (e) {
  console.error("Runtime submodule (lib/runtime) has not been built. Reusing existing binary instead.");
  var libSource = fs.readFileSync(__dirname + "/../src/library.ts").toString();
  var match = /const runtime: string = "([a-zA-Z0-9\+\/]+[=]*)/.exec(libSource);
  if (!match)
    throw Error("failed to parse library.ts");
  runtimeBlob = match[1];
}
out.push(
  "/** Precompiled memory management runtime as a base64-encoded string. */",
  "export const runtime: string = " + JSON.stringify(runtimeBlob) + ";",
  ""
);

fs.writeFileSync(__dirname + "/../src/library.ts", out.join("\n"), "utf8");
