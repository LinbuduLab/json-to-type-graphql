import prettier from "prettier";
import tmp from "tmp";
import fs from "fs-extra";
import path from "path";
import { Project, SourceFile } from "ts-morph";
import {
  checkExistClassDeclarations,
  removeNamedImportsMember,
  setNamedImportsMember,
  removeImportDeclarations,
  appendNamedImportsMember,
  addImportDeclaration,
  ImportType,
  classDeclarationGeneratorFromList,
  createTmpResolverContent,
} from "../src/ast";

let tmpFile: string;
let source: SourceFile;

beforeEach(() => {
  tmpFile = tmp.fileSync().name;

  fs.writeFileSync(
    tmpFile,
    fs.readFileSync(
      path.resolve(__dirname, "./fixtures/ast-fixture.ts"),
      "utf-8"
    )
  );

  source = new Project().addSourceFileAtPath(tmpFile);
});

afterEach(() => {
  fs.rmSync(tmpFile);
  new Project().removeSourceFile(source);
});

describe("should perform AST operations", () => {
  it("should check exist class", () => {
    expect(checkExistClassDeclarations(source)).toEqual(["Foo", "Bar"]);
  });

  it("should remove named imports member", () => {
    removeNamedImportsMember(source, ["Scope"], "ts-morph");

    expect(
      source
        .getImportDeclaration(
          (imp) => imp.getModuleSpecifierValue() === "ts-morph"
        )!
        .getNamedImports()
        .map((x) => x.getName())
    ).not.toContain("Scope");

    expect(
      source
        .getImportDeclaration(
          (imp) => imp.getModuleSpecifierValue() === "ts-morph"
        )!
        .getNamedImports()
        .map((x) => x.getName())
    ).toContain("SyntaxKind");
  });

  it("should set named imports member", () => {
    setNamedImportsMember(source, ["Decorator"], "ts-morph", true);
    expect(
      source
        .getImportDeclaration(
          (imp) => imp.getModuleSpecifierValue() === "ts-morph"
        )!
        .getNamedImports()
        .map((x) => x.getName())
    ).toEqual(["Decorator"]);
  });

  it("should remove import declaration", () => {
    removeImportDeclarations(source, "ts-morph", true);
    expect(
      source.getImportDeclarations().map((imp) => imp.getModuleSpecifierValue())
    ).not.toContain("ts-morph");
  });
  it("should add named imports", () => {
    // exist
    appendNamedImportsMember(source, ["SyntaxKind"], "ts-morph", true);
    // new
    appendNamedImportsMember(source, ["Decorator"], "ts-morph", true);
    expect(
      source
        .getImportDeclaration(
          (imp) => imp.getModuleSpecifierValue() === "ts-morph"
        )!
        .getNamedImports()
        .map((x) => x.getName())
    ).toEqual(["Scope", "SyntaxKind", "Decorator"]);
  });

  it.only("should add import declaration", () => {
    addImportDeclaration(
      source,
      "prettier",
      "prettier",
      ImportType.NAMESPACE_IMPORT
    );

    addImportDeclaration(
      source,
      undefined,
      "reflect-metadata",
      ImportType.DEFAULT_IMPORT
    );

    addImportDeclaration(source, ["green"], "chalk", ImportType.NAMED_IMPORTS);

    const allImps = source
      .getImportDeclarations()
      .map((imp) => imp.getModuleSpecifierValue());

    expect(allImps).toContain("prettier");
    expect(allImps).toContain("reflect-metadata");
    expect(allImps).toContain("chalk");

    expect(
      source
        .getImportDeclaration(
          (imp) => imp.getModuleSpecifierValue() === "prettier"
        )!
        .getNamespaceImport()
        ?.getText()
    ).toEqual("prettier");

    expect(
      source
        .getImportDeclaration(
          (imp) => imp.getModuleSpecifierValue() === "reflect-metadata"
        )!
        .getDefaultImport()
        ?.getText()
    ).toBeUndefined;

    expect(
      source
        .getImportDeclaration(
          (imp) => imp.getModuleSpecifierValue() === "chalk"
        )!
        .getNamedImports()
        .map((x) => x.getText())
    ).toEqual(["green"]);
  });
});
