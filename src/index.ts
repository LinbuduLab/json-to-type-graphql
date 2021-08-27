import fs from "fs-extra";
import { parser } from "./parser";
import { generatorWrapper } from "./generator";
import { formatter } from "./formatter";
import { Options, SourceObject, ValidPrimitiveType } from "./utils";

export default function transformer(
  content: SourceObject | SourceObject[] | ValidPrimitiveType[],
  outputPath: string,
  options?: Options
): void {
  fs.rmSync(outputPath);
  fs.createFileSync(outputPath);

  generatorWrapper(
    outputPath,
    parser(content, options?.parser),
    options?.generator
  );

  formatter(outputPath, options?.formatter);
}
