import { strictTypeChecker, ValidFieldType } from "./utils";

import type { SourceObject, SourceArray, PreprocesserOptions } from "./utils";

export function preprocesser(
  raw: SourceObject | SourceObject[] | SourceArray,
  options: PreprocesserOptions
): SourceObject | SourceObject[] {
  const { preserveObjectOnlyInArray } = options;
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

export function preserveObjectTypeInArrayOnly(
  arr: SourceArray
): SourceObject[] {
  return arr.filter(
    (val) => strictTypeChecker(val) === ValidFieldType.Object
  ) as SourceObject[];
}

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
