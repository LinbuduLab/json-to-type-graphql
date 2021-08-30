import intersection from "lodash/intersection";
import uniqBy from "lodash/uniqBy";

import { strictTypeChecker, capitalCase, ValidFieldType } from "./utils";
import type {
  SourceObject,
  SourceArray,
  ProcessedFieldInfoObject,
  ParsedFieldInfo,
  ParserOptions,
} from "./utils";

/**
 * Parse raw content to specific structure which can be consumed by generator
 * @param content Input content
 * @param options Parser options
 * @returns
 */
export function parser(
  content: SourceObject | SourceArray,
  options: Required<ParserOptions>
): ProcessedFieldInfoObject {
  return Array.isArray(content)
    ? arrayEntryParser(content, options)
    : objectEntryParser(content, options);
}

/**
 * Handle array entry json structure parsing
 * @param content Input content
 * @param options Parser options
 * @returns
 */
export function arrayEntryParser(
  content: SourceArray,
  options: ParserOptions
): ProcessedFieldInfoObject {
  const {
    forceNonNullable,
    forceReturnType,
    arrayEntryProp,
    forceNonNullableListItem,
  } = options;
  const parsedFieldInfo: ProcessedFieldInfoObject = {};

  if (!content.length) return {};

  const randomItem = content[0];
  const type = strictTypeChecker(randomItem);

  switch (type) {
    case ValidFieldType.String:
    case ValidFieldType.Boolean:
    case ValidFieldType.Number:
      parsedFieldInfo["TMP"] = {
        type: ValidFieldType.Primitive_Array,
        propType: typeof randomItem,
        nested: false,
        list: true,
        prop: arrayEntryProp,
        nullable: !forceNonNullable,
        nullableListItem: !forceNonNullableListItem,
        fields: null,
        decoratorReturnType:
          typeof randomItem === "number"
            ? "Int"
            : forceReturnType
            ? strictTypeChecker(randomItem)
            : null,
      };

      break;

    case ValidFieldType.Object:
      parsedFieldInfo["TMP"] = {
        type: ValidFieldType.Object_Array,
        propType: capitalCase(arrayEntryProp),
        nested: true,
        list: true,
        prop: arrayEntryProp,
        nullable: !forceNonNullable,
        nullableListItem: !forceNonNullableListItem,
        fields: objectArrayParser(content as SourceObject[], options),
        decoratorReturnType: capitalCase(arrayEntryProp),
      };

      break;

    case ValidFieldType.Empty_Array:
      parsedFieldInfo["TMP"] = {
        type,
        list: true,
        propType: capitalCase(arrayEntryProp),
        decoratorReturnType: capitalCase(arrayEntryProp),
        nested: true,
        nullable: !forceNonNullable,
        nullableListItem: !forceNonNullableListItem,
        prop: arrayEntryProp,
        fields: {},
      };
      break;

    case ValidFieldType.Primitive_Array:
    case ValidFieldType.Object_Array:
    case ValidFieldType.Null:
    case ValidFieldType.Undefined:
    case ValidFieldType.Ignore:
      break;
  }

  return parsedFieldInfo;
}

/**
 * Handle common object entry json structure parsing
 * @param content Input content
 * @param options Parser options
 * @returns
 */
export function objectEntryParser(
  content: SourceObject | SourceArray,
  options: ParserOptions
): ProcessedFieldInfoObject {
  const { forceNonNullable, forceReturnType, forceNonNullableListItem } =
    options;
  const parsedFieldInfo: ProcessedFieldInfoObject = {};

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
          nullable: !forceNonNullable,
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
          nullable: !forceNonNullable,
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
          nullable: !forceNonNullable,
          decoratorReturnType: capitalCasedKey,
          fields: parser(v, options),
        };

        break;

      case ValidFieldType.Empty_Array:
        parsedFieldInfo[k] = {
          type,
          list: true,
          propType: capitalCasedKey,
          decoratorReturnType: capitalCasedKey,
          nested: true,
          nullable: !forceNonNullable,
          nullableListItem: !forceNonNullableListItem,
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
          fields: null,
          nullable: !forceNonNullable,
          nullableListItem: !forceNonNullableListItem,
          decoratorReturnType:
            typeof v[0] === "number" ? "Int" : strictTypeChecker(v[0]),
        };
        break;

      case ValidFieldType.Object_Array:
        parsedFieldInfo[k] = {
          type,
          list: true,
          propType: capitalCasedKey,
          decoratorReturnType: capitalCasedKey,
          nested: true,
          nullable: !forceNonNullable,
          nullableListItem: !forceNonNullableListItem,
          prop: k,
          fields: objectArrayParser(v, options),
        };
        break;

      case ValidFieldType.Null:
      case ValidFieldType.Undefined:
      case ValidFieldType.Ignore:
        break;
    }
  }

  return parsedFieldInfo;
}

/**
 * Handle object member array parsing
 * @param arr
 * @param options
 * @returns
 */
export function objectArrayParser(
  arr: SourceObject[],
  options: ParserOptions
): ProcessedFieldInfoObject {
  const keys: string[][] = [];
  const parsedKeys: ParsedFieldInfo[] = [];

  const { forceNonNullable } = options ?? {};

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
      ...parser(nonNullSharedItem[0], options)[key],
      shared: true,
      // NOTE: shared keys are regarded as non-nullable value
      // even in common array entry situation
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
        ...parser({ [k]: v }, options)[k],
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
