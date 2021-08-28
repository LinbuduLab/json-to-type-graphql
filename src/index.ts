import fs from "fs-extra";

import { preprocesser } from "./preprocesser";
import { parser } from "./parser";
import { generator } from "./generator";
import { formatter } from "./formatter";

import { ARRAY_ENTRY_STRUCTURE_PROP } from "./utils";
import type { Options, SourceObject, ValidPrimitiveType } from "./utils";

export default function transformer(
  content: SourceObject | SourceObject[],
  outputPath: string,
  options?: Options
): void {
  fs.rmSync(outputPath);
  fs.createFileSync(outputPath);

  const {
    forceNonNullable = false,
    forceReturnType = false,
    arrayEntryProp = ARRAY_ENTRY_STRUCTURE_PROP,
  } = options?.parser ?? {};

  const { preserveObjectOnlyInArray = true } = options?.preprocesser ?? {};

  generator(
    outputPath,
    parser(preprocesser(content, { preserveObjectOnlyInArray }), {
      forceNonNullable,
      forceReturnType,
      arrayEntryProp,
    }),
    options?.generator
  );

  formatter(outputPath, options?.formatter);
}
