import path from "path";
import jsonfile from "jsonfile";
import transformer from "./src";
const outputPath = path.join(__dirname, "./testing.ts");

const content = jsonfile.readFileSync("./sample.json");
// const content = jsonfile.readFileSync("./array-entry.json");

transformer(content, outputPath, {
  parser: {
    // forceNonNullable: true,
    // forceReturnType: true,
    forceNonNullableListItem: true,
  },
  preprocesser: {
    preserveObjectOnlyInArray: true,
  },
  generator: {
    prefix: true,
  },
});
