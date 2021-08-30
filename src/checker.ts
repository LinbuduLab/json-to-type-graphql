import path from "path";
import fs from "fs-extra";
import { Project } from "ts-morph";
import execa from "execa";
import { createTmpResolverContent } from "./ast";

import type { CheckerOptions } from "./utils";

export async function checker(outputPath: string, options: CheckerOptions) {
  if (options.disable) return;

  const outputDir = path.dirname(outputPath);
  const tmpFilePath = path.resolve(outputDir, "generated_checker.ts");

  fs.ensureFileSync(tmpFilePath);

  fs.writeFileSync(tmpFilePath, fs.readFileSync(outputPath, "utf-8"));

  const project = new Project();

  const checkerOnlySource = project.addSourceFileAtPath(tmpFilePath);

  createTmpResolverContent(checkerOnlySource, "Root");

  try {
    await execa(
      `ts-node ${tmpFilePath}`,
      [
        "--compiler-options",
        JSON.stringify({
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          declaration: false,
          ...options.executeOptions,
        }),
      ],
      {
        shell: true,
        stdio: "inherit",
        ...options.execaOptions,
      }
    );
  } catch (error) {
    throw error;
  } finally {
    !options.keep && fs.rmSync(tmpFilePath);
  }
}
