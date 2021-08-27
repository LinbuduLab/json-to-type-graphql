import { Options as PrettierOptions } from "prettier";

export type PlainObject = Record<string, unknown>;

export type SourceObject = Record<string, ValidPrimitiveType | "object">;

export type ValidPrimitiveType = "string" | "number" | "boolean";

export type ParserOptions = {
  forceNonNullable: boolean;
  forceReturnType: boolean;
};

export type GeneratorOptions = {
  entryClassName: string;
  suffix: boolean | string;
  publicProps: string[];
  readonlyProps: string[];
};

export type FormatterOptions = {
  disable: boolean;
} & PrettierOptions;

export type Options = {
  parser?: Partial<ParserOptions>;
  generator?: Partial<GeneratorOptions>;
  formatter?: FormatterOptions;
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
