import prettier from "prettier";
import fs from "fs-extra";
import type { Options } from "./utils";

export function formatter(outputPath: string, options?: Options["formatter"]) {
  const formatted = prettier.format(fs.readFileSync(outputPath, "utf-8"), {
    parser: "typescript",
    tabWidth: 2,
    ...options,
  });

  fs.writeFileSync(outputPath, formatted);
}
