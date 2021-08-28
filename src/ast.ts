import { ClassDeclarationStructure, OptionalKind, SourceFile } from "ts-morph";
import { ensureArray } from "./utils";

export type ClassGeneratorRecordList =
  OptionalKind<ClassDeclarationStructure>[];

export function classDeclarationGenerator(
  source: SourceFile,
  record: ClassGeneratorRecordList,
  apply?: boolean
): void {
  record.reverse().forEach((classStru) => source.addClass(classStru));

  apply && source.saveSync();
}

export function checkExistClassDeclarations(source: SourceFile): string[] {
  return source.getClasses().map((x) => x.getName()!);
}

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

export function addImportDeclaration(
  source: SourceFile,
  namespace: string,
  moduleSpecifier: string,
  importType: ImportType.NAMESPACE_IMPORT,
  apply?: boolean
): void;

export function addImportDeclaration(
  source: SourceFile,
  namedImports: string[],
  moduleSpecifier: string,
  importType: ImportType.NAMED_IMPORTS,
  apply?: boolean
): void;

export function addImportDeclaration(
  source: SourceFile,
  defaultImport: string,
  moduleSpecifier: string,
  importType: ImportType.DEFAULT_IMPORT,
  apply?: boolean
): void;

export function addImportDeclaration(
  source: SourceFile,
  importClause: string | string[],
  moduleSpecifier: string,
  importType: ImportType,
  apply?: boolean
) {
  switch (importType) {
    case ImportType.DEFAULT_IMPORT:
      if (typeof importClause !== "string") throw new Error();

      source.addImportDeclaration({
        defaultImport: importClause,
        moduleSpecifier,
      });

      break;

    case ImportType.NAMED_IMPORTS:
      source.addImportDeclaration({
        namedImports: ensureArray(importClause),
        moduleSpecifier,
      });

      break;

    case ImportType.NAMESPACE_IMPORT:
      if (typeof importClause !== "string") throw new Error();

      source.addImportDeclaration({
        namespaceImport: importClause as string,
        moduleSpecifier: moduleSpecifier,
      });

      break;

    default:
      return;
  }

  apply && source.saveSync();
}
