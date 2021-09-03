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
  removeClassDeclarations,
  classDeclarationGeneratorFromList,
  createTmpResolverContent,
  classDeclarationGenerator,
  invokeClassDeclarationGenerator,
} from "../src/ast";
import {
  BASE_MODULE_SPECIFIER,
  CHECKER_IMPORTS,
  CHECKER_MODULE_SPECIFIER,
} from "../src/utils";

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
  it("should generate simple class declaration", () => {
    invokeClassDeclarationGenerator(
      source,

      {
        FooBar: {
          info: {
            name: "FooBar",
          },
          parent: null,
          children: [],
          generated: false,
        },
        Wuhu: {
          info: {
            name: "Wuhu",
          },
          parent: null,
          children: [],
          generated: false,
        },
      },
      true
    );

    expect(source.getClasses().map((x) => x.getName())).toContain("Wuhu");
    expect(source.getClasses().map((x) => x.getName())).toContain("FooBar");
  });

  it("should skip generated class info", () => {
    invokeClassDeclarationGenerator(
      source,

      {
        FooBar: {
          info: {
            name: "FooBar",
          },
          parent: null,
          children: [],
          generated: true,
        },
        Wuhu: {
          info: {
            name: "Wuhu",
          },
          parent: null,
          children: [],
          generated: true,
        },
      },
      true
    );

    expect(source.getClasses().map((x) => x.getName())).not.toContain("Wuhu");
    expect(source.getClasses().map((x) => x.getName())).not.toContain("FooBar");
  });

  it("should generate with child info", () => {
    invokeClassDeclarationGenerator(
      source,

      {
        FooBar: {
          info: {
            name: "FooBar",
          },
          parent: null,
          children: ["Wuhu"],
          generated: false,
        },
        Wuhu: {
          info: {
            name: "Wuhu",
          },
          parent: "FooBar",
          children: ["WuhuChild"],
          generated: false,
        },
        WuhuChild: {
          info: {
            name: "WuhuChild",
          },
          parent: "Wuhu",
          children: [],
          generated: false,
        },
      },
      true
    );

    expect(source.getClasses().map((x) => x.getName())).toContain("FooBar");
    expect(source.getClasses().map((x) => x.getName())).toContain("Wuhu");
    expect(source.getClasses().map((x) => x.getName())).toContain("WuhuChild");
  });

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

  it("should add import declaration", () => {
    addImportDeclaration(
      source,
      "prettier",
      "prettier",
      ImportType.NAMESPACE_IMPORT,
      true
    );

    addImportDeclaration(
      source,
      undefined,
      "reflect-metadata",
      ImportType.DEFAULT_IMPORT,
      true
    );

    addImportDeclaration(
      source,
      ["green"],
      "chalk",
      ImportType.NAMED_IMPORTS,
      true
    );

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

  it("should remove class declaration", () => {
    removeClassDeclarations(source, ["Foo"], true);
    expect(source.getClasses().map((cls) => cls.getName()!)).not.toContain(
      "Foo"
    );
    expect(source.getClasses().map((cls) => cls.getName()!)).toContain("Bar");
  });

  it("should create class declarations", () => {
    classDeclarationGeneratorFromList(
      source,
      [{ name: "FooBar" }, { name: "Wuhu" }],
      true
    );
    expect(source.getClasses().map((cls) => cls.getName()!)).toContain(
      "FooBar"
    );
    expect(source.getClasses().map((cls) => cls.getName()!)).toContain("Wuhu");
  });

  it("should create tmp resolver content", () => {
    createTmpResolverContent(
      source,
      {
        buildSchemaOptions: {
          emitSchemaFile: true,
          nullableByDefault: true,
          dateScalarMode: "timestamp",
        },
        disable: false,
        keep: true,
        execaOptions: {},
        executeOptions: {},
      },
      "Root"
    );

    expect(
      source.getImportDeclaration(
        (x) => x.getModuleSpecifierValue() === CHECKER_MODULE_SPECIFIER
      )
    ).toBeDefined();

    expect(
      source
        .getImportDeclaration(
          (x) => x.getModuleSpecifierValue() === CHECKER_MODULE_SPECIFIER
        )
        ?.getDefaultImport()
        ?.getText()
    ).toBeUndefined();

    // expect(
    //   source
    //     .getImportDeclaration(
    //       (x) => x.getModuleSpecifierValue() === BASE_MODULE_SPECIFIER
    //     )
    //     ?.getNamedImports()
    //     .map((x) => x.getText())
    // ).toEqual(CHECKER_IMPORTS);

    const tmpClass = source.getClass((cls) => cls.getName() === "TmpResolver");

    expect(tmpClass).toBeDefined();

    expect(tmpClass?.getDecorator("Resolver")).toBeDefined();

    expect(
      tmpClass
        ?.getDecorator("Resolver")
        ?.getArguments()
        .map((x) => x.getText())[0]
    ).toBe(`(type)=>Root`);

    expect(tmpClass?.getMethod("TmpResolver")).toBeDefined();
    expect(tmpClass?.getMethod("TmpResolver")?.isAsync()).toBeTruthy();
    expect(
      tmpClass?.getMethod("TmpResolver")?.getDecorator("Query")
    ).toBeDefined();
    expect(
      tmpClass
        ?.getMethod("TmpResolver")
        ?.getDecorator("Query")
        ?.getArguments()
        .map((x) => x.getText())[0]
    ).toBe(`(type)=>[Root]`);

    expect(tmpClass?.getMethods().map((x) => x.getName())[0]).toBe(
      "TmpResolver"
    );
  });
});
