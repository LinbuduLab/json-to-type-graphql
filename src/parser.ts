import { capitalCase } from "capital-case";
import { intersection, uniqBy } from "lodash";
import {
  SourceObject,
  Options,
  ValidPrimitive,
  ProcessedFieldInfoObject,
  strictTypeChecker,
  ValidFieldType,
  ParsedFieldInfo,
  ParserOptions,
  PlainObject,
} from "./utils";

export function parser(
  content: SourceObject | SourceObject[] | ValidPrimitive[],
  options?: Options["parser"]
): ProcessedFieldInfoObject {
  const { forceNonNullable = false, forceReturnType = false } = options ?? {};
  const parsedFieldInfo: ProcessedFieldInfoObject = {};

  if (Array.isArray(content)) {
    if (!content.length) return {};

    const randomItem = content[0];

    parsedFieldInfo["TMP"] =
      typeof randomItem === "object"
        ? {
            type: ValidFieldType.Object_Array,
            propType: "Data",
            nested: true,
            list: true,
            prop: "data",
            nullable: false,
            fields: objectArrayParser(content as SourceObject[]),
            decoratorReturnType: "Data",
          }
        : {
            type: ValidFieldType.Primitive_Array,
            propType: typeof randomItem,
            nested: false,
            list: true,
            prop: "data",
            nullable: false,
            fields: null,
            decoratorReturnType: typeof randomItem === "number" ? "Int" : null,
          };

    return parsedFieldInfo;
  }

  for (const [k, v] of Object.entries(content)) {
    const type = strictTypeChecker(v);
    // avoid "nestedType" -> "Nested Type"
    const capitalCasedKey = capitalCase(k, {
      delimiter: "",
    });

    switch (type) {
      case ValidFieldType.String:
      case ValidFieldType.Boolean:
        parsedFieldInfo[k] = {
          type,
          propType: typeof v,
          nested: false,
          prop: k,
          nullable: false,
          list: false,
          fields: null,
          decoratorReturnType: forceReturnType ? type : null,
        };

        break;

      case ValidFieldType.Number:
        parsedFieldInfo[k] = {
          type,
          propType: "number",
          nested: false,
          prop: k,
          nullable: false,
          list: false,
          fields: null,
          decoratorReturnType: "Int",
        };

        break;

      case ValidFieldType.Object:
        parsedFieldInfo[k] = {
          type,
          propType: capitalCasedKey,
          nested: true,
          list: false,
          prop: k,
          nullable: false,
          decoratorReturnType: capitalCasedKey,
          fields: parser(v, { forceNonNullable, forceReturnType }),
        };

        break;

      case ValidFieldType.Empty_Array:
        parsedFieldInfo[k] = {
          type,
          list: true,
          propType: capitalCasedKey,
          decoratorReturnType: capitalCasedKey,
          nested: true,
          nullable: false,
          prop: k,
          fields: {},
        };
        break;

      case ValidFieldType.Primitive_Array:
        parsedFieldInfo[k] = {
          // 原始类型组成的数组
          type,
          propType: typeof v[0],
          nested: false,
          list: true,
          prop: k,
          nullable: false,
          fields: null,
          decoratorReturnType:
            typeof v[0] === "number"
              ? "Int"
              : forceReturnType
              ? strictTypeChecker(v[0])
              : null,
        };
        break;

      case ValidFieldType.Object_Array:
        parsedFieldInfo[k] = {
          type,
          list: true,
          propType: capitalCasedKey,
          decoratorReturnType: capitalCasedKey,
          nested: true,
          nullable: false,
          prop: k,
          fields: objectArrayParser(v, { forceNonNullable, forceReturnType }),
        };

      case ValidFieldType.Null:
      case ValidFieldType.Undefined:
      case ValidFieldType.Ignore:
        break;
    }
  }

  return parsedFieldInfo;
}

export function objectArrayParser<T extends PlainObject>(
  arr: T[],
  options?: ParserOptions
): ProcessedFieldInfoObject {
  const keys: string[][] = [];
  const parsedKeys: ParsedFieldInfo[] = [];

  const { forceNonNullable = false, forceReturnType = false } = options ?? {};

  const processedResult: ProcessedFieldInfoObject = {};

  for (const item of arr) {
    keys.push(Object.keys(item));
  }

  // 在所有成员中都存在的键
  const intersectionKeys = intersection(...keys);

  // 但不一定所有成员中都有值 所以要再次遍历找到一个值一定为真的 使用这个真值作为类型
  intersectionKeys.forEach((key) => {
    // 要考虑 0 "" 这种
    const nonNullSharedItem = arr.filter(
      (item) => item[key] === 0 || item[key] === "" || !![item[key]]
    );

    // 如果没有 就置为object！并且 AST 生成的时候加注释

    const nonNullSharedItemType = nonNullSharedItem.length
      ? typeof nonNullSharedItem[0][key]
      : "object";

    // 这个选出来的值直接交给 parser 处理

    parsedKeys.push({
      ...parser(nonNullSharedItem[0] as SourceObject, {
        forceNonNullable,
        forceReturnType,
      })[key],
      shared: true,
      nullable: false,
    });
  });

  // 遍历所有对象类型的成员 移除交集中存在的键
  for (const item of arr) {
    intersectionKeys.forEach((key) => {
      key in item && delete item[key];
    });
  }

  // 处理剩下的

  for (const item of arr) {
    for (const [k, v] of Object.entries(item)) {
      parsedKeys.push({
        ...parser({ [k]: v } as SourceObject, {
          forceNonNullable,
          forceReturnType,
        })[k],
        shared: false,
        nullable: !forceNonNullable,
      });
    }
  }

  const result = uniqBy(parsedKeys, (key) => key.prop);

  result.forEach((item) => {
    processedResult[item.prop] = item;
  });

  return processedResult;
}
