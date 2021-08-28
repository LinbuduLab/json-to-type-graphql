import { Scope, Project } from "ts-morph";
import type {
  SourceFile,
  DecoratorStructure,
  PropertyDeclarationStructure,
  OptionalKind,
} from "ts-morph";

import { capitalCase } from "./utils";
import type { ProcessedFieldInfoObject, Options } from "./utils";

import {
  addImportDeclaration,
  appendNamedImportsMember,
  checkExistClassDeclarations,
  ImportType,
  setNamedImportsMember,
  ClassGeneratorRecord,
  classDeclarationGenerator,
  classDeclarationGeneratorWrapper,
} from "./ast";

export function generator(
  outputPath: string,
  parsed: ProcessedFieldInfoObject,
  options?: Options["generator"]
) {
  const source = new Project().addSourceFileAtPath(outputPath);
  const classGeneratorRecord: ClassGeneratorRecord = {};

  addImportDeclaration(
    source,
    ["ObjectType", "Field", "Int", "ID"],
    "type-graphql",
    ImportType.NAMED_IMPORTS,
    false
  );

  classDecInfoCollector(
    source,
    parsed,
    classGeneratorRecord,
    undefined,
    options
  );

  // classDeclarationGenerator(source, classGeneratorRecord, true);

  const tmp = reverseRelation(classGeneratorRecord);

  classDeclarationGeneratorWrapper(source, tmp);
}

export function classDecInfoCollector(
  source: SourceFile,
  parsed: ProcessedFieldInfoObject,
  list: ClassGeneratorRecord,
  parent?: string,
  options?: Options["generator"]
): void {
  const {
    entryClassName = "__TMP_CLASS_NAME__",
    publicProps = [],
    readonlyProps = [],
    suffix = false,
  } = options ?? {};

  const classDecorator: OptionalKind<DecoratorStructure>[] = [
    {
      name: "ObjectType",
      arguments: [],
    },
  ];
  const properties: OptionalKind<PropertyDeclarationStructure>[] = [];

  for (const [, v] of Object.entries(parsed)) {
    if (v.nested)
      classDecInfoCollector(source, v.fields!, list, entryClassName, {
        entryClassName: v.propType,
        publicProps,
        readonlyProps,
        suffix,
      });

    // nullable 为 false 时 [Type]!
    // [Type!] 则由选项控制
    const fieldReturnType: string[] = v.decoratorReturnType
      ? v.list
        ? [`(type) => [${v.decoratorReturnType}]`]
        : [`(type) => ${v.decoratorReturnType}`]
      : [];

    if (v.nullable) fieldReturnType.push(`{ nullable: true }`);

    properties.push({
      name: v.prop,
      type: v.list ? `${v.propType}[]` : (v.propType as string),
      decorators: [
        {
          name: "Field",
          arguments: fieldReturnType,
        },
      ],
      scope: publicProps.includes(v.prop) ? Scope.Public : undefined,
      trailingTrivia: (writer) => writer.newLine(),
      hasExclamationToken: !v.nullable,
      hasQuestionToken: v.nullable,
      isReadonly: readonlyProps.includes(v.prop),
    });
  }

  const record = {
    info: {
      name:
        entryClassName === "__TMP_CLASS_NAME__"
          ? "__TMP_CLASS_NAME__"
          : capitalCase(`${entryClassName}`),
      decorators: classDecorator,
      properties,
      isExported: true,
    },
    parent: parent ?? null,
    children: [],
  };

  list[entryClassName] = record;

  source.saveSync();
}

export function reverseRelation(raw: ClassGeneratorRecord) {
  const reversed: ClassGeneratorRecord = {};

  for (const [k, v] of Object.entries(raw)) {
    reversed[k] = v;
  }

  for (const [k, v] of Object.entries(raw)) {
    if (v.parent) {
      reversed[v.parent]["children"].push(k);
    }
  }

  return reversed;
}
