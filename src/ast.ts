import type { ClassDeclaration, SourceFile, Statement, ts } from "ts-morph";

import {
  ensureArray,
  BASE_MODULE_SPECIFIER,
  CHECKER_IMPORTS,
  CHECKER_MODULE_SPECIFIER,
  CheckerOptions,
} from "./utils";
import type { ClassGeneratorRecord, ClassInfo } from "./utils";

/** Global record for class declaration generation */
let collectedInfoRecord: ClassGeneratorRecord = {};

/**
 * Start class declaration generation from reversed record
 * @param source Source
 * @param record Generation record
 * @param apply Should apply change directly to the source file
 * @description Current generation order: `P - C1 - C1-1 - C2 - C2-1 - C3`,
 * will support `P - C1 - C2 - C3 - C1-1 - C1-2 in the future`
 */
export function invokeClassDeclarationGenerator(
  source: SourceFile,
  record: ClassGeneratorRecord,
  apply?: boolean
) {
  collectedInfoRecord = record;

  classDeclarationGenerator(source, record, apply);
}

/**
 * Traverse the global record to generate class declarations
 * Will execute recursively if record item containes non-empty children prop
 * @param source Source
 * @param record Generation record
 * @param apply Should apply change directly to the source file
 */
export function classDeclarationGenerator(
  source: SourceFile,
  record: ClassGeneratorRecord,
  apply?: boolean
): void {
  for (const [k, v] of Object.entries(record)) {
    !v?.generated && source.addClass(v.info);
    v.generated = true;
    if (v.children.length) {
      for (const child of v.children) {
        classDeclarationGenerator(
          source,
          {
            [child]: collectedInfoRecord[child],
          },
          apply
        );
      }
    }
  }

  apply && source.saveSync();
}

/**
 * Check exist class declaration in current source file
 * @param source Source
 * @return List of exist class declaration specifier.
 */
export function checkExistClassDeclarations(source: SourceFile): string[] {
  return source.getClasses().map((x) => x.getName()!);
}

/**
 * Remove named imports from specific import
 * @param source
 * @param namedImportsToRemove
 * @param moduleSpecifier
 * @param apply
 */
export function removeNamedImportsMember(
  source: SourceFile,
  namedImportsToRemove: string[],
  moduleSpecifier: string,
  apply?: boolean
) {
  const target = source.getImportDeclaration(
    (dec) => dec.getModuleSpecifierValue() === moduleSpecifier
  );

  const existNamedImports = target?.getNamedImports();

  const remainedNamedImports =
    existNamedImports
      ?.filter((imp) => !namedImportsToRemove.includes(imp.getText()))
      .map((i) => i.getText()) ?? [];

  setNamedImportsMember(source, remainedNamedImports, moduleSpecifier, false);

  apply && source.saveSync();
}

/**
 * Directly set named imports member, exist named imports will be removed.
 * @param source Source
 * @param namedImports New named imports to set
 * @param moduleSpecifier The import declaration to operate
 * @param apply Should apply change directly to the source file
 */
export function setNamedImportsMember(
  source: SourceFile,
  namedImports: string[],
  moduleSpecifier: string,
  apply?: boolean
) {
  const target = source.getImportDeclaration(
    (dec) => dec.getModuleSpecifierValue() === moduleSpecifier
  );

  target?.removeNamedImports();

  target?.addNamedImports(namedImports);

  apply && source.saveSync();
}

/**
 * Remove specific import declarations
 * @param source
 * @param specifier
 * @param apply
 */
export function removeImportDeclarations(
  source: SourceFile,
  specifier: string | string[],
  apply?: boolean
) {
  const specifierList = ensureArray(specifier);

  source
    .getImportDeclarations()
    .filter((imp) => specifierList.includes(imp.getModuleSpecifierValue()))
    .forEach((imp) => imp.remove());

  apply && source.saveSync();
}

/**
 * Append new named imports member
 * @param source Source
 * @param namedImports New named imports to append
 * @param moduleSpecifier The import declaration to operate
 * @param apply Should apply change directly to the source file
 */
export function appendNamedImportsMember(
  source: SourceFile,
  namedImports: string[],
  moduleSpecifier: string,
  apply?: boolean
) {
  const target = source.getImportDeclaration(
    (dec) => dec.getModuleSpecifierValue() === moduleSpecifier
  );

  const existNamedImports = target
    ?.getNamedImports()
    .map((imp) => imp.getText());

  const namedImportsToAppend = namedImports.filter(
    (imp) => !existNamedImports?.includes(imp)
  );

  target?.addNamedImports(namedImportsToAppend);

  apply && source.saveSync();
}

export enum ImportType {
  NAMESPACE_IMPORT = "NAMESPACE_IMPORT",
  NAMED_IMPORTS = "NAMED_IMPORTS",
  DEFAULT_IMPORT = "DEFAULT_IMPORT",
}

/**
 * Add a namespace import declaration in source file
 * @param source Source
 * @param namespace Namespace import
 * @param moduleSpecifier The import declaration to operate
 */
export function addImportDeclaration(
  source: SourceFile,
  namespace: string,
  moduleSpecifier: string,
  importType: ImportType.NAMESPACE_IMPORT,
  apply?: boolean
): void;

/**
 * Add a named import declaration in source file
 * @param source Source
 * @param namedImports Named imports
 * @param moduleSpecifier The import declaration to operate
 */
export function addImportDeclaration(
  source: SourceFile,
  namedImports: string[],
  moduleSpecifier: string,
  importType: ImportType.NAMED_IMPORTS,
  apply?: boolean
): void;

/**
 * Add a default import declaration in source file
 * @param source Source
 * @param defaultImport Default import
 * @param moduleSpecifier The import declaration to operate
 */
export function addImportDeclaration(
  source: SourceFile,
  defaultImport: string | undefined,
  moduleSpecifier: string,
  importType: ImportType.DEFAULT_IMPORT,
  apply?: boolean
): void;

export function addImportDeclaration(
  source: SourceFile,
  importClause: string | undefined | string[],
  moduleSpecifier: string,
  importType: ImportType,
  apply?: boolean
) {
  switch (importType) {
    case ImportType.DEFAULT_IMPORT:
      source.addImportDeclaration({
        defaultImport: importClause as string,
        moduleSpecifier,
      });

      break;

    case ImportType.NAMED_IMPORTS:
      source.addImportDeclaration({
        namedImports: ensureArray(importClause as string),
        moduleSpecifier,
      });

      break;

    case ImportType.NAMESPACE_IMPORT:
      source.addImportDeclaration({
        namespaceImport: importClause as string,
        moduleSpecifier: moduleSpecifier,
      });

      break;
  }

  apply && source.saveSync();
}

/**
 * Generate class declarations from list
 * @param source
 * @param list
 * @param apply
 */
export function classDeclarationGeneratorFromList(
  source: SourceFile,
  list: ClassInfo[],
  apply?: boolean
): void {
  list.forEach((classInfo) => source.addClass(classInfo));
  apply && source.saveSync();
}

/**
 * Remove class declarations by name list
 * @param source
 * @param names
 * @param apply
 */
export function removeClassDeclarations(
  source: SourceFile,
  names: string[],
  apply?: boolean
): void {
  source
    .getClasses()
    .filter((classDec) => names.includes(classDec.getName()!))
    .forEach((classDec) => {
      classDec.remove();
    });

  apply && source.saveSync();
}

/**
 * Add resolver related import, create resolver class, add buildSchemaSync
 * @param source
 * @param rootType
 * @returns
 */
export function createTmpResolverContent(
  source: SourceFile,
  checkerOptions: CheckerOptions,
  rootType: string
): {
  resolverClass: ClassDeclaration;
  buildSchemaStatements: Statement<ts.Statement>[];
} {
  addImportDeclaration(
    source,
    undefined,
    CHECKER_MODULE_SPECIFIER,
    ImportType.DEFAULT_IMPORT
  );

  appendNamedImportsMember(source, CHECKER_IMPORTS, BASE_MODULE_SPECIFIER);

  const resolverClass = source.addClass({
    name: "TmpResolver",
    isExported: true,
    decorators: [
      {
        name: "Resolver",
        arguments: [`(type)=>${rootType}`],
      },
    ],
    methods: [
      {
        name: "TmpResolver",
        isAsync: true,
        statements: ["return [];"],
        decorators: [
          {
            name: "Query",
            arguments: [`(type)=>[${rootType}]`],
          },
        ],
        returnType: `Promise<${rootType}[]>`,
      },
    ],
  });

  // TODO: enhancement
  const buildSchemaStatements = source.addStatements([
    `
  buildSchemaSync({
    resolvers: [TmpResolver],
    emitSchemaFile: ${checkerOptions.buildSchemaOptions.emitSchemaFile},
    skipCheck: false,
    nullableByDefault: ${checkerOptions.buildSchemaOptions.nullableByDefault},
    dateScalarMode: ${checkerOptions.buildSchemaOptions.dateScalarMode}
  });`,
  ]);

  source.saveSync();

  return {
    resolverClass,
    buildSchemaStatements,
  };
}
