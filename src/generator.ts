import { Scope, Project } from "ts-morph";
import type {
  SourceFile,
  DecoratorStructure,
  PropertyDeclarationStructure,
  OptionalKind,
} from "ts-morph";

import {
  capitalCase,
  DEFAULT_ENTRY_CLASS_NAME,
  GeneratorOptions,
  RecordValue,
  ValidFieldType,
} from "./utils";
import type {
  ProcessedFieldInfoObject,
  Options,
  ClassGeneratorRecord,
} from "./utils";

import {
  addImportDeclaration,
  ImportType,
  invokeClassDeclarationGenerator,
  checkExistClassDeclarations,
} from "./ast";

export function generator(
  parsed: ProcessedFieldInfoObject,
  outputPath: string,
  options: GeneratorOptions
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

  collectClassStruInfo(
    source,
    parsed,
    classGeneratorRecord,
    undefined,
    options
  );

  reverseRelation(classGeneratorRecord);

  invokeClassDeclarationGenerator(source, classGeneratorRecord, true);
}

export function collectClassStruInfo(
  source: SourceFile,
  parsed: ProcessedFieldInfoObject,
  record: ClassGeneratorRecord,
  parent: string | undefined,
  options: GeneratorOptions
): void {
  const { entryClassName, publicProps, readonlyProps, suffix, prefix } =
    options;

  const classDecorator: OptionalKind<DecoratorStructure>[] = [
    {
      name: "ObjectType",
      arguments: [],
    },
  ];
  const properties: OptionalKind<PropertyDeclarationStructure>[] = [];

  for (const [, v] of Object.entries(parsed)) {
    if (v.nested) {
      collectClassStruInfo(source, v.fields!, record, entryClassName, {
        ...options,
        entryClassName: prefix ? `${entryClassName}${v.propType}` : v.propType,
      });
    }

    // nullable 为 false 时 [Type]!
    // [Type!] 则由选项控制

    const returned = prefix
      ? [
          ValidFieldType.Boolean,
          ValidFieldType.String,
          ValidFieldType.Number,
          ValidFieldType.Primitive_Array,
        ].includes(v.type)
        ? ""
        : `${capitalCase(entryClassName)}`
      : "";

    const fieldReturnType: string[] = v.decoratorReturnType
      ? v.list
        ? [`(type) => [${returned}${v.decoratorReturnType}]`]
        : [`(type) => ${returned}${v.decoratorReturnType}`]
      : [];

    if (v.nullable) fieldReturnType.push(`{ nullable: true }`);

    properties.push({
      name: v.prop,
      type: v.list
        ? `${returned}${v.propType}[]`
        : `${returned}${v.propType as string}`,
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

  // record[entryClassName] = currentRecord;
  source.addClass(currentRecord.info);
}

export function reverseRelation(raw: ClassGeneratorRecord) {
  for (const [k, v] of Object.entries(raw)) {
    raw[k] = v;
  }

  for (const [k, v] of Object.entries(raw)) {
    if (v.parent) {
      raw[v.parent]["children"].push(k);
    }
  }
}
