var fs = require("fs");

fs.exists(__dirname + "/../lib/typescript/TypeScript/src/compiler/diagnosticInformationMap.generated.ts", function(exists) {
  process.exit(exists ? 0 : 1);
});
