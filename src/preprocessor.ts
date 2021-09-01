import { MaybeArray, strictTypeChecker, ValidFieldType } from "./utils";
import omit from "lodash/omit";

import type { SourceObject, SourceArray, PreprocessorOptions } from "./utils";

/**
 * Pre-process raw content before it's passed to parser.
 * Nested array will be removed for now(not support yet).
 * @param raw
 * @param options
 * @returns
 */
export function preprocessor(
  raw: MaybeArray<SourceObject> | SourceArray,
  options: PreprocessorOptions
): MaybeArray<SourceObject> | SourceArray {
  if (
    options.customPreprocessor &&
    typeof options.customPreprocessor === "function"
  ) {
    return options.customPreprocessor(
      raw,
      omit(options, ["customPreprocessor"])
    );
  }

  if (Array.isArray(raw)) {
    return arrayPreprocessor(raw, options);
  }

  for (const [k, v] of Object.entries(raw)) {
    // extract as `nestedArray`
    if (Array.isArray(v)) {
      v.length && Array.isArray(v[0])
        ? // delete nested array directly at first
          delete raw[k]
        : (raw[k] = preprocessor(v, options));
    }

    if (strictTypeChecker(v) === ValidFieldType.Object) {
      preprocessor(v, options);
    }
  }

  return raw;
}

/**
 * Ensure only object or primitive type exist in an array.
 * @param raw
 * @param param1
 * @returns
 */
export function arrayPreprocessor(
  raw: SourceArray,
  { preserveObjectOnlyInArray }: PreprocessorOptions
) {
  if (!raw.length) return raw;

  const { primitives, objects, shouldApplyProcess } = shouldProcess(raw);

  return shouldApplyProcess
    ? preserveObjectOnlyInArray
      ? objects
      : primitives
    : raw;
}

type ShouldProcessResult = {
  primitives: SourceArray;
  objects: SourceObject[];
  shouldApplyProcess: boolean;
};

/**
 * Determine should process array and split primitive & object members
 * @param arr
 * @returns
 */
export function shouldProcess(
  arr: SourceArray | SourceObject[]
): ShouldProcessResult {
  const primitives = preservePrimitiveTypeInArrayOnly(arr);

  const objects = preserveObjectTypeInArrayOnly(arr);

  return {
    primitives,
    objects,
    shouldApplyProcess: primitives.length !== 0 && objects.length !== 0,
  };
}

/**
 * Preserve only object type in an array, primitive type will be removed.
 * @param arr
 * @returns
 */
export function preserveObjectTypeInArrayOnly(
  arr: SourceArray
): SourceObject[] {
  return arr.filter(
    (val) => strictTypeChecker(val) === ValidFieldType.Object
  ) as SourceObject[];
}

/**
 * Preserve only primitive type in an array, object type will be removed.
 * @param arr
 * @returns
 */
export function preservePrimitiveTypeInArrayOnly(
  arr: SourceArray
): SourceArray {
  return arr.filter((val) =>
    [
      ValidFieldType.Number,
      ValidFieldType.Boolean,
      ValidFieldType.String,
    ].includes(strictTypeChecker(val))
  );
}
