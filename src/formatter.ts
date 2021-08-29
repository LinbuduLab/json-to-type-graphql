import prettier from "prettier";
import fs from "fs-extra";
import type { FormatterOptions } from "./utils";

/**
 * Format generated file by Prettier
 * @param outputPath File path to output file
 * @param options Format options
 */
export function formatter(outputPath: string, options: FormatterOptions) {
  if (options.disable) return;

  const formatted = prettier.format(fs.readFileSync(outputPath, "utf-8"), {
    parser: "typescript",
    tabWidth: 2,
    ...options,
  });

  fs.writeFileSync(outputPath, formatted);
}
