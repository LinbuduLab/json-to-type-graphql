import path from "path";
import fs from "fs-extra";
import jsonfile from "jsonfile";
import transformer from "./src";

const outputPath = path.join(__dirname, "./generated.ts");

const content = jsonfile.readFileSync("./demo.json");

fs.existsSync(outputPath) && fs.rmSync(outputPath);

transformer(content, outputPath, { generator: { entryClassName: "Root" } });
