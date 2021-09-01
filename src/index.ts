import fs from "fs-extra";
import { Project } from "ts-morph";
import util from "util";

import { reader } from "./reader";
import { preprocessor } from "./preprocessor";
import { parser } from "./parser";
import { generator } from "./generator";
import { postprocessor } from "./postprocessor";
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

  const { preserveObjectOnlyInArray = true, customPreprocessor = undefined } =
    options?.preprocessor ?? {};

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

  const { customPostprocessor = undefined } = options.postprocessor ?? {};

  const {
    disable: disableChecker = true,
    keep = false,
    execaOptions = {},
    executeOptions = {},
    buildSchemaOptions = {},
  } = options.checker ?? {};

  const {
    format = true,
    override,
    formatOptions,
    outputPath,
  } = options.writter ?? {};

  const originInput = content;

  const preprocessed = preprocessor(originInput, {
    preserveObjectOnlyInArray,
    customPreprocessor,
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

  postprocessor(source, {
    customPostprocessor,
    // removeUnusedDecorators,
  });

  await checker(outputPath, {
    disable: sort || disableChecker,
    keep,
    execaOptions,
    executeOptions,
    buildSchemaOptions,
  });

  writter({ outputPath, format, formatOptions, override });
}
