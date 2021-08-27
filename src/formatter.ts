import prettier from "prettier";
import fs from "fs-extra";

export function formatter(content: string, outputPath: string) {
  const formatted = prettier.format(content, {
    parser: "typescript",
  });

  fs.writeFileSync(formatted, outputPath);
}
