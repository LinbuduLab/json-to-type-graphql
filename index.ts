import fs from "fs-extra";
import path from "path";
import jsonfile from "jsonfile";
import { parser } from "./src/parser";
import { generatorWrapper } from "./src/generator";

const outputPath = path.join(__dirname, "./testing.ts");

fs.rmSync(outputPath);
fs.createFileSync(outputPath);

const content = jsonfile.readFileSync("./sample.json");

generatorWrapper(outputPath, parser(content));
