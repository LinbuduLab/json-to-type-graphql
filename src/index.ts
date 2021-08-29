import fs from "fs-extra";

import { preprocesser } from "./preprocesser";
import { parser } from "./parser";
import { generator } from "./generator";
import { formatter } from "./formatter";

import { ARRAY_ENTRY_STRUCTURE_PROP } from "./utils";
import type { Options, SourceObject } from "./utils";

export default function handler(
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

  const originInput = content;

  preprocesser(originInput, { preserveObjectOnlyInArray });

  const parsedInfo = parser(content, {
    forceNonNullable,
    forceReturnType,
    arrayEntryProp,
  });

  generator(parsedInfo, outputPath, options?.generator);

  formatter(outputPath, options?.formatter);
}
