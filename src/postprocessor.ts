import { SourceFile } from "ts-morph";
import omit from "lodash/omit";

import type { PostprocessorOptions } from "./utils";

/**
 * Post-process source file after it's processed by generator.
 * @param source
 * @param options
 * @returns
 */
export function postprocessor(
  source: SourceFile,
  options: PostprocessorOptions
): void {
  if (
    options.customPostprocessor &&
    typeof options.customPostprocessor === "function"
  ) {
    options.customPostprocessor(source, omit(options, ["customPostprocessor"]));
  }

  // TODO: remove unused decorators
  // TODO: more...
}
