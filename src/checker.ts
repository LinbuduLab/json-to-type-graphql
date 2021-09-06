import path from "path";
import fs from "fs-extra";
import { Project } from "ts-morph";
import execa from "execa";
import { createTmpResolverContent } from "./ast";

import type { CheckerOptions } from "./utils";

/**
 * Check can generated schema be used by buildSchemaSync
 * @param outputPath generated path
 * @param options checker options
 * @returns
 */
export async function checker(outputPath: string, options: CheckerOptions) {
  if (options.disable) return;

  const outputDir = path.dirname(outputPath);
  const tmpFilePath = path.resolve(outputDir, "generated_checker.ts");

  fs.ensureFileSync(tmpFilePath);

  fs.writeFileSync(tmpFilePath, fs.readFileSync(outputPath, "utf-8"));

  const project = new Project();

  const checkerOnlySource = project.addSourceFileAtPath(tmpFilePath);

  try {
    createTmpResolverContent(checkerOnlySource, options, "Root");

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
    !options.keep && fs.existsSync(tmpFilePath) && fs.rmSync(tmpFilePath);
  }
}
