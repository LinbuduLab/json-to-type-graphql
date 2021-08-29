import { strictTypeChecker, ValidFieldType } from "./utils";

import type { SourceObject, PreprocesserOptions } from "./utils";

export function preprocesser(
  raw: SourceObject | SourceObject[],
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
        : (raw[k] = preprocesser(v, options) as unknown as "object");
    }

    if (strictTypeChecker(v) === ValidFieldType.Object) {
      preprocesser(v as unknown as SourceObject, options);
    }
  }

  return raw;
}

export function arrayPreprocesser<T extends SourceObject>(
  raw: T[],
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
  primitives: SourceObject[];
  objects: SourceObject[];
  shouldApplyProcess: boolean;
};

export function shouldProcess<T extends SourceObject>(
  arr: T[]
): ShouldProcessResult {
  const primitives = preservePrimitiveTypeInArrayOnly(arr);

  const objects = preserveObjectTypeInArrayOnly(arr);

  return {
    primitives,
    objects,
    shouldApplyProcess: primitives.length !== 0 && objects.length !== 0,
  };
}

export function preserveObjectTypeInArrayOnly<T extends SourceObject>(
  arr: T[]
): SourceObject[] {
  return arr.filter((val) => strictTypeChecker(val) === ValidFieldType.Object);
}

export function preservePrimitiveTypeInArrayOnly<T extends SourceObject>(
  arr: T[]
): SourceObject[] {
  return arr.filter((val) =>
    [
      ValidFieldType.Number,
      ValidFieldType.Boolean,
      ValidFieldType.String,
    ].includes(strictTypeChecker(val))
  );
}
