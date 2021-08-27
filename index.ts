import path from "path";
import jsonfile from "jsonfile";
import transformer from "./src";
const outputPath = path.join(__dirname, "./testing.ts");

const content = jsonfile.readFileSync("./sample.json");

transformer(content, outputPath, {});
