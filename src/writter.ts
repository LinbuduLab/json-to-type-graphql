import prettier from "prettier";
import fs from "fs-extra";
import type { WriterOptions } from "./utils";

/**
 * Format generated file and write
 * @param param
 */
export function writter({
  outputPath,
  override,
  format,
  formatOptions,
}: WriterOptions) {
  if (!outputPath) throw new Error("writer.outputPath is required!");

  const raw = fs.readFileSync(outputPath, "utf-8");

  const formatted = format
    ? prettier.format(raw, {
        parser: "typescript",
        tabWidth: 2,
        ...formatOptions,
      })
    : raw;

  fs.writeFileSync(outputPath, formatted);
}
