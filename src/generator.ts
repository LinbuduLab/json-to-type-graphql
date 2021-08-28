import { Scope, Project } from "ts-morph";
import type {
  SourceFile,
  DecoratorStructure,
  PropertyDeclarationStructure,
  OptionalKind,
} from "ts-morph";

import { capitalCase } from "./utils";
import type { ProcessedFieldInfoObject, Options } from "./utils";

import { addImportDeclaration, ImportType } from "./ast";

export function generator(
  outputPath: string,
  parsed: ProcessedFieldInfoObject,
  options?: Options["generator"]
) {
  const source = new Project().addSourceFileAtPath(outputPath);

  addImportDeclaration(
    source,
    ["ObjectType", "Field", "Int", "ID"],
    "type-graphql",
    ImportType.NAMED_IMPORTS,
    false
  );

  classDeclarationGenerator(source, parsed, options);
}

export function classDeclarationGenerator(
  source: SourceFile,
  parsed: ProcessedFieldInfoObject,
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
      classDeclarationGenerator(source, v.fields!, {
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

  source.addClass({
    name:
      entryClassName === "__TMP_CLASS_NAME__"
        ? "__TMP_CLASS_NAME__"
        : capitalCase(`${entryClassName}`),
    decorators: classDecorator,
    properties,
    isExported: true,
  });

  source.saveSync();
}
