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
import intersection from "lodash/intersection";
import uniqBy from "lodash/uniqBy";
import remove from "lodash/remove";

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
// 'Type' suffix

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
  objectList?: boolean;
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
          ? typeof v[0] === "object"
            ? // 对象类型组成的数组
              {
                type: inferObjectTypeFromArray(k, v),
                nested: true,
                list: true,
                objectList: true,
                prop: k,
                decoratorReturnType: null,
              }
            : {
                type: arrayItemType(v),
                nested: false,
                list: true,
                prop: k,
                decoratorReturnType: `[${
                  arrayItemType(v) === "number" ? "Int" : arrayItemType(v)
                }]`,
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

type InferredObjectType = {
  key: string;
  shared: boolean;
  type: PossibleFieldType;
};

type ObjectTypeRecord = {
  abstractType: string;
  contains: InferredObjectType[];
};

// TODO: 把所有对象的key拿出来 key: string[]
// 取交集
// 不在交集的 加? nullable: true
// [{a,b}]
function inferObjectTypeFromArray<T extends PlainObject>(
  key: string,
  arr: T[]
) {
  const keys: string[][] = [];
  const processedArrayObjectKey: ObjectTypeRecord = {
    abstractType: `${capitalCase(key)}`,
    contains: [],
  };

  for (const item of arr) {
    keys.push(Object.keys(item));
  }

  const intersectionProps = intersection(...keys);

  // 处理交集键
  intersectionProps.forEach((prop) => {
    processedArrayObjectKey.contains.push({
      key: prop,
      shared: true,
      type: typeof arr[0][prop],
    });
  });

  for (const item of arr) {
    for (const [k, v] of Object.entries(item)) {
      processedArrayObjectKey.contains.push({
        key: k,
        shared: false,
        type: typeof v,
      });
    }
  }

  processedArrayObjectKey.contains = remove(
    uniqBy(processedArrayObjectKey.contains, (key) => key.key),
    (item) => !(intersectionProps.includes(item.key) && !item.shared)
  );

  console.log("processedArrayObjectKey: ", processedArrayObjectKey);

  return processedArrayObjectKey;
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
  parsed: ProcessedFieldInfoObject,
  className = "__TMP_CLASS_NAME__"
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

    const fieldReturnType = v.decoratorReturnType
      ? [`(type) => ${v.decoratorReturnType}`]
      : [];

    // 用 reduce 可能更好
    properties.push({
      name: v.prop,
      type: v.list ? `${v.type}[]` : (v.type as string),
      decorators: [
        {
          name: "Field",
          arguments: fieldReturnType,
        },
      ],
      // scope: Scope.Public,
      trailingTrivia: (writer) => writer.newLine(),
      hasExclamationToken: true,
      hasQuestionToken: false,
      isReadonly: false,
    });
  }

  source.addClass({
    name: className,
    decorators: classDecorator,
    properties,
    isExported: true,
  });

  source.saveSync();
}

function objectArrayHandler(info: ObjectTypeRecord, classIdentifier: string) {
  // 原 class 需要加上一个 field 指向这个对象类型
  // 为这个field新建一个对象类型
  const classDecorator: OptionalKind<DecoratorStructure>[] = [
    {
      name: "ObjectType",
      arguments: [],
    },
  ];
  const properties: OptionalKind<PropertyDeclarationStructure>[] = [];

  for (const fields of info.contains) {
    properties.push({
      name: fields.key,
      type: fields.type as string,
      decorators: [
        {
          name: "Field",
          arguments: [],
        },
      ],
      // scope: Scope.Public,
      trailingTrivia: (writer) => writer.newLine(),
      hasExclamationToken: true,
      hasQuestionToken: false,
      isReadonly: false,
    });
  }

  source.addClass({
    name: info.abstractType,
    decorators: classDecorator,
    properties,
    isExported: true,
  });
}

// 看起来需要一个专门处理 Record[] 类型的 generator？

function formatter() {}

// consola.log(
//   util.inspect(parser(content), {
//     depth: 999,
//   })
// );

generator(parser(content));

// parser(content);
