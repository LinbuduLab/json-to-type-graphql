import path from "path";
import fs from "fs-extra";
import jsonfile from "jsonfile";
import transformer from "..";

const outputPath = path.join(__dirname, "./generated.ts");

const content = jsonfile.readFileSync(path.join(__dirname, "./demo.json"));

fs.existsSync(outputPath) && fs.rmSync(outputPath);

(async () => {
  await transformer(outputPath, {
    // reader: { path: path.join(__dirname, "./demo.json") },
    reader: { url: "https://dog.ceo/api/breeds/image/random" },
    parser: {
      forceNonNullableListItem: true,
    },
    generator: { entryClassName: "Root" },
  });
})();
