import type { SourceFile } from "ts-morph";

import { ClassInfo, ensureArray, reverseObjectKeys } from "./utils";
import type { ClassGeneratorRecord } from "./utils";

let collectedInfoRecord: ClassGeneratorRecord = {};

export function invokeClassDeclarationGenerator(
  source: SourceFile,
  record: ClassGeneratorRecord,
  apply?: boolean
) {
  // 这种模式下的生成顺序：
  // P - C1 - C1-1 - C2 - C2-1 - C3
  // 另外一种可能需要的生成顺序
  // P - C1 - C2 - C3 - C1-1 - C1-2
  const reversedRecord = reverseObjectKeys(record);

  collectedInfoRecord = reversedRecord;

  classDeclarationGenerator(source, reversedRecord, apply);
}

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
        classDeclarationGenerator(source, {
          [child]: collectedInfoRecord[child],
        });
      }
    }
  }

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
      source.addImportDeclaration({
        defaultImport: importClause as string,
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

export function classDeclarationGeneratorFromList(
  source: SourceFile,
  list: ClassInfo[],
  apply?: boolean
): void {
  list.forEach((classInfo) => source.addClass(classInfo));
  apply && source.saveSync();
}
