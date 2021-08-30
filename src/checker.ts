import path from "path";
import fs from "fs-extra";
import { Project } from "ts-morph";
import execa from "execa";
import {
  createTmpResolverContent,
  addImportDeclaration,
  setNamedImportsMember,
  removeNamedImportsMember,
  removeImportDeclarations,
} from "./ast";
import source from "got/dist/source";

// 创建一个文件，引用生成路径的根类型来写入 resolver
// 再创建一个文件，引用这个

// 在创建完毕的文件中新增 resolver
// 新增 Resolver Query 导入
// 新增临时文件 引用这一路径
// 尝试 buildSchema
export async function checker(outputPath: string) {
  const outputDir = path.dirname(outputPath);
  const tmpFilePath = path.resolve(outputDir, "generated_checker.ts");

  fs.ensureFileSync(tmpFilePath);

  fs.writeFileSync(tmpFilePath, fs.readFileSync(outputPath, "utf-8"));

  const project = new Project();

  const checkerOnlySource = project.addSourceFileAtPath(tmpFilePath);

  const { resolverClass, buildSchemaStatements } = createTmpResolverContent(
    checkerOnlySource,
    "Root"
  );

  try {
    await execa(
      `ts-node ${tmpFilePath}`,
      [
        "--compiler-options",
        JSON.stringify({
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
        }),
      ],
      {
        shell: true,
        stdio: "inherit",
      }
    );
  } catch (error) {
    throw error;
  } finally {
    fs.rmSync(tmpFilePath);
  }

  // resolverClass.remove();

  // buildSchemaStatements.forEach((statement) => statement.remove());

  // removeImportDeclarations(checkerOnlySource, ["reflect-metadata"], true);
  // removeNamedImportsMember(
  //   checkerOnlySource,
  //   ["Resolver", "Query"],
  //   "type-graphql",
  //   true
  // );
}
