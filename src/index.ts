import fs from "fs-extra";

import { parser } from "./parser";
import { generator } from "./generator";
import { formatter } from "./formatter";

import type { Options, SourceObject, ValidPrimitiveType } from "./utils";

export default function transformer(
  content: SourceObject | SourceObject[] | ValidPrimitiveType[],
  outputPath: string,
  options?: Options
): void {
  fs.rmSync(outputPath);
  fs.createFileSync(outputPath);

  generator(outputPath, parser(content, options?.parser), options?.generator);

  formatter(outputPath, options?.formatter);
}
