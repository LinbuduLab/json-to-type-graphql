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
  DEFAULT_SUFFIX,
  normalizeClassFix,
  normalizeTypeFix,
} from "./utils";
import type {
  ProcessedFieldInfoObject,
  ClassGeneratorRecord,
  GeneratorOptions,
  RecordValue,
} from "./utils";

import {
  addImportDeclaration,
  ImportType,
  invokeClassDeclarationGenerator,
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

  const classPrefix = normalizeClassFix(prefix, entryClassName);
  const classSuffix = normalizeClassFix(suffix, DEFAULT_SUFFIX);
  for (const [, v] of Object.entries(parsed)) {
    const typePrefix = normalizeTypeFix(classPrefix, v.type);
    const typeSuffix = normalizeTypeFix(classSuffix, v.type);

    const propType = `${typePrefix}${v.propType}${typeSuffix}${
      v.list ? "[]" : ""
    }`;

    const returnType = `${typePrefix}${v.decoratorReturnType}${typeSuffix}`;

    if (v.nested) {
      collectClassStruInfo(source, v.fields!, record, entryClassName, {
        ...options,
        entryClassName: `${classPrefix}${v.propType}${typeSuffix}`,
      });
    }

    const fieldReturnType: string[] = v.decoratorReturnType
      ? v.list
        ? [
            `(type) => [${returnType}${v.nullableListItem ? "" : "!"}]${
              v.nullable ? "" : "!"
            }`,
          ]
        : [`(type) => ${returnType}${v.nullable ? "" : "!"}`]
      : [];

    if (v.nullable) fieldReturnType.push(`{ nullable: true }`);

    if (v.prop === "ff") {
      console.log(v, fieldReturnType);
    }

    properties.push({
      name: v.prop,
      type: propType,
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
  for (const [k, v] of Object.entries(raw)) {
    raw[k] = v;
  }

  for (const [k, v] of Object.entries(raw)) {
    if (v.parent) {
      raw[v.parent]["children"].push(k);
    }
  }
}
