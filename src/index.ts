import fs from "fs-extra";
import util from "util";

import { preprocesser } from "./preprocesser";
import { parser } from "./parser";
import { generator } from "./generator";
import { formatter } from "./formatter";

import { ARRAY_ENTRY_STRUCTURE_PROP, DEFAULT_ENTRY_CLASS_NAME } from "./utils";
import type { Options, SourceObject } from "./utils";

/**
 * Generate TypeGraphQL class declaration from JSON object
 * @param content Input raw content
 * @param outputPath Output file path
 * @param options
 */
export default function handler(
  content: SourceObject | SourceObject[],
  outputPath: string,
  options?: Options
): void {
  fs.createFileSync(outputPath);

  const { preserveObjectOnlyInArray = true, customPreprocesser = undefined } =
    options?.preprocesser ?? {};

  const {
    forceNonNullable = false,
    forceReturnType = false,
    arrayEntryProp = ARRAY_ENTRY_STRUCTURE_PROP,
    forceNonNullableListItem = false,
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

  const preprocessed = preprocesser(originInput, {
    preserveObjectOnlyInArray,
    customPreprocesser,
  });

  const parsedInfo = parser(preprocessed, {
    forceNonNullable,
    forceReturnType,
    arrayEntryProp,
    forceNonNullableListItem,
  });

  generator(parsedInfo, outputPath, {
    prefix,
    publicProps,
    readonlyProps,
    entryClassName,
    suffix,
  });

  formatter(outputPath, { disable });
}
