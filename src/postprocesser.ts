import { SourceFile } from "ts-morph";
import omit from "lodash/omit";

import type { PostprocesserOptions } from "./utils";

export function postprocesser(
  source: SourceFile,
  options: PostprocesserOptions
): void {
  if (
    options.customPostprocesser &&
    typeof options.customPostprocesser === "function"
  ) {
    options.customPostprocesser(source, omit(options, ["customPostprocesser"]));
  }

  // TODO: remove unused decorators
  // TODO: more...
}
