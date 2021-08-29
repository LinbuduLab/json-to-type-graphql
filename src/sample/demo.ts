import path from "path";
import fs from "fs-extra";
import jsonfile from "jsonfile";
import transformer from "..";

const outputPath = path.join(__dirname, "./generated.ts");

const content = jsonfile.readFileSync(path.join(__dirname, "./demo.json"));

fs.existsSync(outputPath) && fs.rmSync(outputPath);

transformer(content, outputPath, {
  parser: {
    forceNonNullableListItem: true,
  },
  generator: { entryClassName: "Root" },
});
