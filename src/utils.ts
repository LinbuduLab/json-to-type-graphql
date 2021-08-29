import { Options as PrettierOptions } from "prettier";
import { capitalCase as originalCapitalCase } from "capital-case";
import { OptionalKind, ClassDeclarationStructure } from "ts-morph";

// avoid "nestedType" -> "Nested Type"
export const capitalCase: typeof originalCapitalCase = (str) =>
  originalCapitalCase(str, { delimiter: "" });

export type ClassGeneratorRecord = Record<
  string,
  {
    info: OptionalKind<ClassDeclarationStructure>;
    parent: string | null;
    children: string[];
    generated: boolean;
  }
>;

export type ClassInfo = OptionalKind<ClassDeclarationStructure>;

export const ARRAY_ENTRY_STRUCTURE_PROP = "data";

export const DEFAULT_ENTRY_CLASS_NAME = "__TMP_CLASS_NAME__";

export const DEFAULT_ENTRY_CLASS_NAME_SUFFIX = "__TMP_CLASS_NAME_TYPE__";

export type PlainObject = Record<string, unknown>;

export type SourceObject = Record<string, ValidPrimitiveType | "object">;

export type ValidPrimitiveType = "string" | "number" | "boolean";

export type RecordValue<T> = T extends Record<string, infer R> ? R : never;

export type ParserOptions = {
  forceNonNullable: boolean;
  forceNonNullableListItem: boolean;
  forceReturnType: boolean;
  arrayEntryProp: string;
};

export type GeneratorOptions = {
  entryClassName: string;
  prefix: boolean | string;
  suffix: boolean | string;
  publicProps: string[];
  readonlyProps: string[];
};

export type FormatterOptions = {
  disable: boolean;
} & PrettierOptions;

export type PreprocesserOptions = {
  preserveObjectOnlyInArray?: boolean;
};

export type Options = {
  preprocesser?: Partial<PreprocesserOptions>;
  parser?: Partial<ParserOptions>;
  generator?: Partial<GeneratorOptions>;
  formatter?: Partial<FormatterOptions>;
};

export type ParsedFieldInfo = {
  type: ValidFieldType;
  nested: boolean;
  prop: string;
  propType: "string" | "number" | "boolean" | string;
  list: boolean;
  nullable: boolean;
  decoratorReturnType: string | null;
  fields: ProcessedFieldInfoObject | null;
  shared?: boolean;
  nullableListItem?: boolean;
};

export type ProcessedFieldInfoObject = Record<string, ParsedFieldInfo>;

export const enum ValidFieldType {
  Null = "Null",
  Undefined = "Undefined",
  String = "String",
  Number = "Number",
  Boolean = "Boolean",
  Object = "Object",
  Primitive_Array = "Primitive_Array",
  Object_Array = "Object_Array",
  Empty_Array = "Empty_Array",
  Ignore = "Ignore",
}

export function ensureArray<T>(maybeArray: T | T[]): T[] {
  return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
}

export function reverseObjectKeys(
  object: ClassGeneratorRecord
): ClassGeneratorRecord {
  const result: ClassGeneratorRecord = {};
  for (const key of Object.keys(object).reverse()) {
    result[key] = object[key];
  }

  return result;
}

export function strictTypeChecker(val: unknown): ValidFieldType {
  if (val === null) return ValidFieldType.Null;
  if (typeof val === "undefined") return ValidFieldType.Undefined;
  if (typeof val === "string") return ValidFieldType.String;
  if (typeof val === "number") return ValidFieldType.Number;
  if (typeof val === "boolean") return ValidFieldType.Boolean;

  if (Array.isArray(val)) {
    if (!val.length) return ValidFieldType.Empty_Array;
    return ["string", "number", "boolean"].includes(typeof val[0])
      ? ValidFieldType.Primitive_Array
      : ValidFieldType.Object_Array;
  }

  if (typeof val === "object") return ValidFieldType.Object;

  return ValidFieldType.Ignore;
}

export function normalizeClassFix(
  fix: string | boolean,
  fallback: string
): string {
  return fix ? (typeof fix === "string" ? fix : fallback) : "";
}

export function normalizeTypeFix(fix: string, type: ValidFieldType): string {
  return [
    ValidFieldType.Boolean,
    ValidFieldType.String,
    ValidFieldType.Number,
    ValidFieldType.Primitive_Array,
  ].includes(type)
    ? ""
    : capitalCase(fix);
}
