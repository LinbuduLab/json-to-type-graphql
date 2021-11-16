import fs from "fs-extra";
import { Project } from "ts-morph";

import { reader } from "./reader";
import { preprocessor } from "./preprocessor";
import { parser } from "./parser";
import { generator } from "./generator";
import { postprocessor } from "./postprocessor";
import { checker } from "./checker";
import { writter } from "./writter";

import { normalizeOptions } from "./utils";
import type { Options } from "./utils";

/**
 * Generate TypeGraphQL class declaration from JSON object
 * @param content Input raw content
 * @param outputPath Output file path
 * @param options
 */
export default async function handler(options: Options): Promise<void> {
  const content = await reader(options.reader);

  const {
    normalizedPreprocessorOptions,
    normalizedParserOptions,
    normalizedGeneratorOptions,
    normalizedPostprocessorOptions,
    normalizedCheckerOptions,
    normalizedWritterOptions,
  } = normalizeOptions(options);

  const originInput = content;

  const preprocessed = preprocessor(originInput, normalizedPreprocessorOptions);

  const parsedInfo = parser(preprocessed, normalizedParserOptions);

  fs.ensureFileSync(normalizedWritterOptions.outputPath);

  const source = new Project().addSourceFileAtPath(
    normalizedWritterOptions.outputPath
  );

  generator(source, parsedInfo, normalizedGeneratorOptions);

  postprocessor(source, normalizedPostprocessorOptions);

  await checker(normalizedWritterOptions.outputPath, normalizedCheckerOptions);
  writter(normalizedWritterOptions);
}

export * from "./reader";
export * from "./preprocessor";
export * from "./parser";
export * from "./generator";
export * from "./postprocessor";
export * from "./checker";
export * from "./writter";
