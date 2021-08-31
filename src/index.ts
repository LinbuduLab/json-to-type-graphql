import fs from "fs-extra";
import { Project } from "ts-morph";
import util from "util";

import { reader } from "./reader";
import { preprocesser } from "./preprocesser";
import { parser } from "./parser";
import { generator } from "./generator";
import { postprocesser } from "./postprocesser";
import { checker } from "./checker";
import { writter } from "./writter";

import { ARRAY_ENTRY_STRUCTURE_PROP, DEFAULT_ENTRY_CLASS_NAME } from "./utils";
import type { Options } from "./utils";

/**
 * Generate TypeGraphQL class declaration from JSON object
 * @param content Input raw content
 * @param outputPath Output file path
 * @param options
 */
export default async function handler(options: Options): Promise<void> {
  const content = await reader(options.reader);

  const { preserveObjectOnlyInArray = true, customPreprocesser = undefined } =
    options?.preprocesser ?? {};

  const {
    forceNonNullable = true,
    forceReturnType = false,
    arrayEntryProp = ARRAY_ENTRY_STRUCTURE_PROP,
    forceNonNullableListItem = false,
  } = options.parser ?? {};

  const {
    prefix = false,
    publicProps = [],
    readonlyProps = [],
    suffix = false,
    entryClassName = DEFAULT_ENTRY_CLASS_NAME,
    sort = true,
  } = options.generator ?? {};

  const { customPostprocesser = undefined } = options.postprocesser ?? {};

  const {
    disable: disableChecker = true,
    keep = false,
    execaOptions = {},
    executeOptions = {},
    // buildSchemaOptions = {},
  } = options.checker ?? {};

  const {
    format = true,
    override,
    formatOptions,
    outputPath,
  } = options.writter ?? {};

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

  fs.ensureFileSync(outputPath);

  const source = new Project().addSourceFileAtPath(outputPath);

  generator(source, parsedInfo, {
    prefix,
    publicProps,
    readonlyProps,
    entryClassName,
    suffix,
    sort,
  });

  postprocesser(source, {
    customPostprocesser,
    // removeUnusedDecorators,
  });

  await checker(outputPath, {
    disable: sort || disableChecker,
    keep,
    execaOptions,
    executeOptions,
  });

  writter({ outputPath, format, formatOptions, override });
}
