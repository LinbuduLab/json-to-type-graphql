import fs from "fs-extra";
import util from "util";

import { preprocesser } from "./preprocesser";
import { parser } from "./parser";
import { generator } from "./generator";
import { formatter } from "./formatter";

import { ARRAY_ENTRY_STRUCTURE_PROP, DEFAULT_ENTRY_CLASS_NAME } from "./utils";
import type { Options, SourceObject } from "./utils";

export default function handler(
  content: SourceObject | SourceObject[],
  outputPath: string,
  options?: Options
): void {
  fs.rmSync(outputPath);
  fs.createFileSync(outputPath);

  const { preserveObjectOnlyInArray = true } = options?.preprocesser ?? {};

  const {
    forceNonNullable = false,
    forceReturnType = false,
    arrayEntryProp = ARRAY_ENTRY_STRUCTURE_PROP,
  } = options?.parser ?? {};

  const {
    prefix = false,
    publicProps = [],
    readonlyProps = [],
    suffix = false,
    entryClassName = DEFAULT_ENTRY_CLASS_NAME,
  } = options?.generator ?? {};

  const { disable = false } = options?.formatter ?? {};

  const originInput = content;

  preprocesser(originInput, { preserveObjectOnlyInArray });

  const parsedInfo = parser(content, {
    forceNonNullable,
    forceReturnType,
    arrayEntryProp,
  });

  // console.log("parsedInfo: ", util.inspect(parsedInfo, { depth: 99 }));

  generator(parsedInfo, outputPath, {
    prefix,
    publicProps,
    readonlyProps,
    entryClassName,
    suffix,
  });

  formatter(outputPath, options?.formatter);
}
