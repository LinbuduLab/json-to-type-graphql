import jsonfile from "jsonfile";
import { GraphQLScalarType } from "graphql";
import { capitalCase } from "capital-case";
import { Int } from "type-graphql";
import consola from "consola";
import util from "util";
import {
  DecoratorStructure,
  OptionalKind,
  Project,
  PropertyDeclarationStructure,
  Scope,
  SourceFile,
} from "ts-morph";
import fs from "fs-extra";
import prettier from "prettier";
import { addImportDeclaration, ImportType } from "./ast";

// json schema 2 ts?
// 卧槽，还要处理数组
// TODO: 结合 ObjectType 的配置
// TODO: ? 与 !
// TODO: 配置
// rootClassName
// optional field
// apply ! to all field
// readonly field
// import all decorators
// public keyword
// apply ! to all list decorator types
// id field

const content = jsonfile.readFileSync("./sample.json");

type PossibleFieldType =
  | "string"
  | "boolean"
  | "number"
  | "array"
  | string
  | PlainObject;

type PlainObject = Record<string, unknown>;

type OriginObject = Record<string, PossibleFieldType>;

type ProcessedFieldInfoObject = Record<string, ProcessedFieldInfo>;

type ProcessedFieldInfo = {
  type: PossibleFieldType;
  nested: boolean;
  prop: string;
  decoratorReturnType: GraphQLScalarType | string | null;
  fields?: ProcessedFieldInfoObject;
  // TODO:
  list?: boolean;
};

function parser(content: OriginObject): ProcessedFieldInfoObject {
  const parsedFieldInfo: ProcessedFieldInfoObject = {};

  for (const [k, v] of Object.entries(content)) {
    switch (typeof v) {
      case "string":
      case "boolean":
        parsedFieldInfo[k] = {
          type: typeof v as "string" | "boolean" | "number",
          nested: false,
          prop: k,
          decoratorReturnType: null,
        };

        break;

      case "number":
        parsedFieldInfo[k] = {
          type: "number",
          nested: false,
          prop: k,
          decoratorReturnType: "Int",
        };

        break;

      // use Object.toString.call instead
      // numberFieldHandler ...
      // 先处理原始类型数组吧
      // 对于数组：查看是否是同一类型，不是就直接跳掉
      // 对于同一类型 先拿到

      case "object":
        parsedFieldInfo[k] = Array.isArray(v)
          ? {
              type: arrayItemType(v),
              nested: false,
              list: true,
              prop: k,
              decoratorReturnType: `${arrayItemType(v)}[]`,
            }
          : {
              type: capitalCase(k),
              nested: true,
              prop: k,
              decoratorReturnType: capitalCase(k),
              fields: parser(content[k] as OriginObject),
            };
        break;
    }
  }

  return parsedFieldInfo;
}

function arrayItemType<T extends any[]>(arr: T[]) {
  return typeof arr[0];
}

fs.rmSync("./testing.ts");
fs.createFileSync("./testing.ts");
const source = new Project().addSourceFileAtPath("./testing.ts");

addImportDeclaration(
  source,
  ["ObjectType", "Field", "Int", "ID"],
  "type-graphql",
  ImportType.NAMED_IMPORTS
);

function generator(
  parsed: Record<string, ProcessedFieldInfo>,
  className?: string
): void {
  const classDecorator: OptionalKind<DecoratorStructure>[] = [
    {
      name: "ObjectType",
      arguments: [],
    },
  ];
  const properties: OptionalKind<PropertyDeclarationStructure>[] = [];

  for (const [, v] of Object.entries(parsed)) {
    if (v.nested) generator(v.fields!, v.type as string);

    const fieldReturnType =
      v.type === "number" ? (v.list ? `[Int]` : `Int`) : `${v.type}`;

    // 用 reduce 可能更好
    properties.push({
      name: v.prop,
      type: v.list ? `${v.type}[]` : (v.type as string),
      decorators: [
        {
          name: "Field",
          arguments: ["string", "boolean"].includes(v.type as string)
            ? []
            : [`(type) => ${fieldReturnType}`],
        },
      ],
      // scope: Scope.Public,
      trailingTrivia: (writer) => writer.newLine(),
      hasExclamationToken: true,
      hasQuestionToken: false,
      isReadonly: false,
    });
  }

  // TODO: export
  source.addClass({
    name: className ?? "__TMP_CLASS_NAME__",
    decorators: classDecorator,
    properties,
    isExported: true,
  });

  source.saveSync();
}

function formatter() {}

// consola.log(
//   util.inspect(parser(content), {
//     depth: 999,
//   })
// );

generator(parser(content));
