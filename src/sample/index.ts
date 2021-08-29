import path from "path";
import fs from "fs-extra";
import jsonfile from "jsonfile";
import transformer from "..";
const outputPath = path.join(__dirname, "./testing.ts");

const content = jsonfile.readFileSync(path.join(__dirname, "./sample.json"));
// const content = jsonfile.readFileSync("./array-entry.json");

fs.existsSync(outputPath) && fs.rmSync(outputPath);

transformer(content, outputPath, {
  parser: {
    // forceNonNullable: true,
    // forceReturnType: true,
    // forceNonNullableListItem: true,
  },
  preprocesser: {
    preserveObjectOnlyInArray: true,
    // customPreprocesser: (raw, options) => raw,
  },
  generator: {
    prefix: false,
    suffix: false,
  },
});
