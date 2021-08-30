import { MaybeArray, strictTypeChecker, ValidFieldType } from "./utils";

import type { SourceObject, SourceArray, PreprocesserOptions } from "./utils";

/**
 * Pre-process raw content before it's passed to parser.
 * Nested array will be removed for now(not support yet).
 * @param raw
 * @param options
 * @returns
 */
export function preprocesser(
  raw: MaybeArray<SourceObject> | SourceArray,
  options: PreprocesserOptions
): MaybeArray<SourceObject> | SourceArray {
  if (
    options.customPreprocesser &&
    typeof options.customPreprocesser === "function"
  ) {
    return options.customPreprocesser(raw, options);
  }

  if (Array.isArray(raw)) {
    return arrayPreprocesser(raw, options);
  }

  for (const [k, v] of Object.entries(raw)) {
    if (Array.isArray(v)) {
      v.length && Array.isArray(v[0])
        ? // delete nested array directly at first
          delete raw[k]
        : (raw[k] = preprocesser(v, options));
    }

    if (strictTypeChecker(v) === ValidFieldType.Object) {
      preprocesser(v, options);
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
export function arrayPreprocesser(
  raw: SourceArray,
  { preserveObjectOnlyInArray }: PreprocesserOptions
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
