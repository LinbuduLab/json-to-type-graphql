import path from "path";
import fs from "fs-extra";
import tmp from "tmp";
import * as execa from "execa";
import { Project, SourceFile } from "ts-morph";
import { checker } from "../src/checker";
import { CHECKER_MODULE_SPECIFIER } from "../src/utils";

const outputPath = path.resolve(__dirname, "./fixtures/generated-fixture.ts");

const emptyOutputPath = path.resolve(__dirname, "./fixtures/empty-fixtures.ts");

const tmpFilePath = path.resolve(
  path.dirname(outputPath),
  "generated_checker.ts"
);

let source: SourceFile;

beforeEach(() => {
  fs.ensureFileSync(tmpFilePath);
  source = new Project().addSourceFileAtPath(tmpFilePath);
});

afterEach(() => {
  // fs.rmSync(tmpFilePath);
  new Project().removeSourceFile(source);
});
describe("should check generated code", () => {
  it("should skip when disabled", async () => {
    const ensureFileSync = jest.spyOn(fs, "ensureFileSync");
    const writeFileSync = jest.spyOn(fs, "writeFileSync");

    await checker(outputPath, {
      disable: true,
      keep: true,
      execaOptions: {},
      executeOptions: {},
      buildSchemaOptions: {},
    });

    expect(ensureFileSync).not.toHaveBeenCalled();
    expect(writeFileSync).not.toHaveBeenCalled();
  });

  it("should generate check file", async () => {
    await checker(outputPath, {
      disable: false,
      keep: true,
      execaOptions: {},
      executeOptions: {},
      buildSchemaOptions: {},
    });

    const checkerImport = source.getImportDeclaration(
      (imp) => imp.getModuleSpecifierValue() === CHECKER_MODULE_SPECIFIER
    );

    expect(checkerImport).toBeDefined();

    expect(checkerImport?.getDefaultImport()?.getText()).toBeUndefined();

    const resolverClass = source.getClass("TmpResolver");

    expect(resolverClass).toBeDefined();

    expect(resolverClass?.getDecorator("Resolver")).toBeDefined();
    expect(
      resolverClass
        ?.getDecorator("Resolver")
        ?.getArguments()
        .map((x) => x.getText())
    ).toEqual(["(type)=>Root"]);

    expect(resolverClass?.getMethod("TmpResolver")?.isAsync()).toBeTruthy();
    expect(
      resolverClass?.getMethod("TmpResolver")?.getDecorator("Query")
    ).toBeDefined();
    expect(
      resolverClass
        ?.getMethod("TmpResolver")
        ?.getDecorator("Query")
        ?.getArguments()
        .map((x) => x.getText())
    ).toEqual(["(type)=>[Root]"]);

    expect(
      resolverClass
        ?.getMethod("TmpResolver")
        ?.getStatements()
        .map((x) => x.getText())
    ).toEqual(["return [];"]);

    expect(fs.readFileSync(tmpFilePath, "utf-8")).toContain("buildSchemaSync");
  });

  it("should keep generated checker by keep option", async () => {
    await checker(outputPath, {
      disable: false,
      keep: false,
      execaOptions: {},
      executeOptions: {},
      buildSchemaOptions: {},
    });

    expect(fs.existsSync(tmpFilePath)).toBeFalsy();

    await checker(outputPath, {
      disable: false,
      keep: true,
      execaOptions: {},
      executeOptions: {},
      buildSchemaOptions: {},
    });

    expect(fs.existsSync(tmpFilePath)).toBeTruthy();
  });

  it.skip("should throw when erorr encountered", async () => {
    const outputSource = new Project().addSourceFileAtPath(outputPath);

    outputSource.getClasses().map((cls) => cls.remove());

    outputSource.saveSync();

    await expect(
      checker(outputPath, {
        disable: true,
        keep: true,
        execaOptions: {},
        executeOptions: {},
        buildSchemaOptions: {},
      })
    ).rejects.toThrow();
  });
});
