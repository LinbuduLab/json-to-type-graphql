import intersection from "lodash/intersection";
import uniqBy from "lodash/uniqBy";

import {
  strictTypeChecker,
  ARRAY_ENTRY_STRUCTURE_PROP,
  capitalCase,
  ValidFieldType,
} from "./utils";
import type {
  SourceObject,
  Options,
  ValidPrimitiveType,
  ProcessedFieldInfoObject,
  ParsedFieldInfo,
  ParserOptions,
  PlainObject,
} from "./utils";

export function parser(
  content: SourceObject | SourceObject[] | ValidPrimitiveType[],
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
            propType: capitalCase(ARRAY_ENTRY_STRUCTURE_PROP),
            nested: true,
            list: true,
            prop: ARRAY_ENTRY_STRUCTURE_PROP,
            nullable: false,
            fields: objectArrayParser(content as SourceObject[]),
            decoratorReturnType: capitalCase("Data"),
          }
        : {
            type: ValidFieldType.Primitive_Array,
            propType: typeof randomItem,
            nested: false,
            list: true,
            prop: ARRAY_ENTRY_STRUCTURE_PROP,
            nullable: false,
            fields: null,
            decoratorReturnType: typeof randomItem === "number" ? "Int" : null,
          };

    return parsedFieldInfo;
  }

  for (const [k, v] of Object.entries(content)) {
    const type = strictTypeChecker(v);
    const capitalCasedKey = capitalCase(k);

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
          fields: parser(v as unknown as SourceObject, {
            forceNonNullable,
            forceReturnType,
          }),
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
          fields: objectArrayParser(v as unknown as PlainObject[], {
            forceNonNullable,
            forceReturnType,
          }),
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

  const intersectionKeys = intersection(...keys);

  intersectionKeys.forEach((key) => {
    const nonNullSharedItem = arr.filter(
      (item) => item[key] === 0 || item[key] === "" || !![item[key]]
    );

    parsedKeys.push({
      ...parser(nonNullSharedItem[0] as SourceObject, {
        forceNonNullable,
        forceReturnType,
      })[key],
      shared: true,
      nullable: false,
    });
  });

  for (const item of arr) {
    intersectionKeys.forEach((key) => {
      key in item && delete item[key];
    });
  }

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
