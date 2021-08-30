import { SourceFile } from "ts-morph";
import { PostprocesserOptions } from "./utils";
import omit from "lodash/omit";

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
