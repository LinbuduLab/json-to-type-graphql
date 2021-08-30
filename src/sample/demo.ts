import path from "path";
import fs from "fs-extra";
import transformer from "..";

const outputPath = path.join(__dirname, "./generated.ts");

fs.existsSync(outputPath) && fs.rmSync(outputPath);

(async () => {
  await transformer(outputPath, {
    reader: { path: path.join(__dirname, "./demo.json") },
    // reader: { path: path.join(__dirname, "./sample.json") },
    // reader: { url: "https://dog.ceo/api/breeds/image/random" },
    parser: {
      forceNonNullable: false,
      forceReturnType: false,
      forceNonNullableListItem: false,
    },
    generator: { entryClassName: "Root", sort: false },
    checker: {
      disable: false,
    },
  });
})();
