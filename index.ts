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
  | "object"
  | "array"
  | "object_array"
  | string
  | PlainObject;

type PlainObject = Record<string, unknown>;

type OriginObject = Record<string, PossibleFieldType>;

type ProcessedFieldInfoObject = Record<string, ProcessedFieldInfo>;

type ProcessedFieldInfo = {
  type: PossibleFieldType;
  nested: boolean;
  prop: string;
  list: boolean;
  nullable: boolean;
  decoratorReturnType: string | null;
  fields: ProcessedFieldInfoObject | null;
  shared?: boolean;
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
          nullable: false,
          list: false,
          fields: null,
          decoratorReturnType: null,
        };

        break;

      case "number":
        parsedFieldInfo[k] = {
          type: "number",
          nested: false,
          prop: k,
          nullable: false,
          list: false,
          fields: null,
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
            ? {
                type: capitalCase(k, {
                  delimiter: "",
                }),
                list: true,
                decoratorReturnType: capitalCase(k, {
                  delimiter: "",
                }),
                nested: true,
                nullable: false,
                prop: k,
                fields: objectArrayParser(v),
              }
            : {
                // 原始类型组成的数组
                type: arrayItemType(v) as any,
                nested: false,
                list: true,
                prop: k,
                nullable: false,
                fields: null,
                decoratorReturnType:
                  arrayItemType(v) === "number" ? "Int" : null,
              }
          : {
              // 普通对象
              type: capitalCase(k, {
                delimiter: "",
              }),
              nested: true,
              list: false,
              prop: k,
              nullable: false,
              decoratorReturnType: capitalCase(k, {
                delimiter: "",
              }),
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

//
function objectArrayParser<T extends PlainObject>(
  arr: T[]
): ProcessedFieldInfoObject {
  const keys: string[][] = [];
  const processedKeys: ProcessedFieldInfo[] = [];

  const processedResult: ProcessedFieldInfoObject = {};

  for (const item of arr) {
    keys.push(Object.keys(item));
  }

  // 在所有成员中都存在
  const intersectionKeys = intersection(...keys);

  // 但不一定所有成员中都有值 所以要再次遍历找到一个值为真的

  intersectionKeys.forEach((key) => {
    // 要考虑 0 "" 这种
    const nonNullSharedItem = arr.filter(
      (item) => item[key] === 0 || item[key] === "" || !![item[key]]
    );

    // 如果没有 就置为object！并且 AST 生成的时候加注释

    const nonNullSharedItemType = nonNullSharedItem.length
      ? typeof nonNullSharedItem[0][key]
      : "object";

    // 这个选出来的值应该直接交给 parser 处理
    // 只是把最后的 shared 附加上去？

    // console.log(parser(nonNullSharedItem[0] as OriginObject));

    processedKeys.push({
      ...parser(nonNullSharedItem[0] as OriginObject)[key],
      shared: true,
    });
  });

  // 处理剩下的

  for (const item of arr) {
    for (const [k, v] of Object.entries(item)) {
      console.log(parser({ [k]: v } as OriginObject));

      processedKeys.push({
        prop: k,
        type: typeof v,
        nullable: true,
        list: false,
        nested: false,
        fields: null,
        shared: false,
        decoratorReturnType: typeof v === "number" ? "Int" : null,
        // ...parser({k:v} as OriginObject),
      });
    }
  }

  const result = remove(
    uniqBy(processedKeys, (key) => key.prop),
    (item) => !(intersectionKeys.includes(item.prop) && !item.shared)
  );

  result.forEach((item) => {
    processedResult[item.prop] = item;
  });

  return processedResult;
}

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
    abstractType: `${capitalCase(key, {
      delimiter: "",
    })}`,
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
      ? v.list
        ? [`(type) => [${v.decoratorReturnType}]`]
        : [`(type) => ${v.decoratorReturnType}`]
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
      // nullable 为 true 的字段需要加? ，且 @Field 中需要对应的加参数，西内，有点麻烦属实
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
