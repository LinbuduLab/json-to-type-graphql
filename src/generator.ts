import { Scope, Project } from "ts-morph";
import type {
  SourceFile,
  DecoratorStructure,
  PropertyDeclarationStructure,
  OptionalKind,
} from "ts-morph";

import { capitalCase, DEFAULT_ENTRY_CLASS_NAME, RecordValue } from "./utils";
import type {
  ProcessedFieldInfoObject,
  Options,
  ClassGeneratorRecord,
} from "./utils";

import {
  addImportDeclaration,
  ImportType,
  invokeClassDeclarationGenerator,
} from "./ast";

export function generator(
  parsed: ProcessedFieldInfoObject,
  outputPath: string,
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

  const finalRecord = reverseRelation(classGeneratorRecord);

  invokeClassDeclarationGenerator(source, finalRecord, true);
}

export function classDecInfoCollector(
  source: SourceFile,
  parsed: ProcessedFieldInfoObject,
  record: ClassGeneratorRecord,
  parent?: string,
  options?: Options["generator"]
): void {
  const {
    entryClassName = DEFAULT_ENTRY_CLASS_NAME,
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
      classDecInfoCollector(source, v.fields!, record, entryClassName, {
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

  const currentRecord: RecordValue<ClassGeneratorRecord> = {
    info: {
      name:
        entryClassName === DEFAULT_ENTRY_CLASS_NAME
          ? DEFAULT_ENTRY_CLASS_NAME
          : capitalCase(`${entryClassName}`),
      decorators: classDecorator,
      properties,
      isExported: true,
    },
    parent: parent ?? null,
    children: [],
    generated: false,
  };

  record[entryClassName] = currentRecord;
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
