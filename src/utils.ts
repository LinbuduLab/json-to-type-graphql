import { Options as PrettierOptions } from "prettier";
import { capitalCase as originalCapitalCase } from "capital-case";
import { OptionalKind, ClassDeclarationStructure, SourceFile } from "ts-morph";
import { Options as GotOptions } from "got";
import { Options as ExecaOptions } from "execa";
import { CompilerOptions } from "typescript";
import { BuildSchemaOptions } from "type-graphql";

/**
 * Capitalize string, avoid incorrect behaviour like: "nestedType" -> "Nested Type"
 * @param str
 * @returns
 */
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

export const DEFAULT_ENTRY_CLASS_NAME = "Root";

export const DEFAULT_ENTRY_CLASS_NAME_SUFFIX = "__TMP_CLASS_NAME_TYPE__";

export const DEFAULT_SUFFIX = "Type";

export const BASE_IMPORTS = ["ObjectType", "Field", "Int", "ID"];
export const BASE_MODULE_SPECIFIER = "type-graphql";

export const CHECKER_IMPORTS = ["Resolver", "Query", "buildSchemaSync"];
export const CHECKER_MODULE_SPECIFIER = "reflect-metadata";

export type SourceObject = Record<string, any>;

export type SourceArray = Array<string | boolean | number | SourceObject>;

export type ValidPrimitiveType = "string" | "number" | "boolean";

export type RecordValue<T> = T extends Record<string, infer R> ? R : never;

export type MaybeArray<T> = T | Array<T>;

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

export type ReaderOptions = {
  path?: string;
  url?: string;
  options?: GotOptions;
  raw?: SourceObject | SourceObject[] | SourceArray;
};

/**
 * Custom preprocess function
 */
export type PreprocesserFunc = (
  raw: SourceObject | SourceObject[] | SourceArray,
  options: Omit<PreprocesserOptions, "customPreprocesser">
) => MaybeArray<SourceObject> | SourceArray;

export type PreprocesserOptions = {
  preserveObjectOnlyInArray: boolean;
  customPreprocesser?: PreprocesserFunc;
};

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
  sort: boolean;
};

export type PostprocesserFunc = (
  source: SourceFile,
  options: Omit<PostprocesserOptions, "customPostprocesser">
) => void;

export type PostprocesserOptions = {
  // removeUnusedDecorators: boolean;
  customPostprocesser?: PostprocesserFunc;
};

export type CheckerOptions = {
  disable: boolean;
  keep: boolean;
  execaOptions: ExecaOptions;
  executeOptions: CompilerOptions;
  // buildSchemaOptions: Omit<BuildSchemaOptions, "resolvers">;
};

export type WriterOptions = {
  outputPath: string;
  override?: boolean;
  format?: boolean;
  formatOptions?: PrettierOptions;
};

export type Options = {
  /**
   * Options pass to reader
   */
  reader: Partial<ReaderOptions>;
  /**
   * Options pass to pre-processer
   */
  preprocesser?: Partial<PreprocesserOptions>;
  /**
   * Options pass to parser
   */
  parser?: Partial<ParserOptions>;
  /**
   * Options pass to generator
   */
  generator?: Partial<GeneratorOptions>;
  /**
   * Options pass to post-processer
   */
  postprocesser?: Partial<PostprocesserOptions>;
  /**
   * Options pass to checker
   */
  checker?: Partial<CheckerOptions>;
  /**
   * Options pass to writer
   */
  writter: WriterOptions;
};

export type ProcessedFieldInfoObject = Record<string, ParsedFieldInfo>;

/**
 * Valid field type
 * which can be used by parser and generator to perform different operations on.
 */
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

/**
 * Ensure args to be array
 * @param maybeArray
 * @returns
 */
export function ensureArray<T>(maybeArray: T | T[]): T[] {
  return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
}

/**
 * Simply reverse object by reversing its keys.
 * @param object
 * @returns
 */
export function reverseObjectKeys(
  object: ClassGeneratorRecord
): ClassGeneratorRecord {
  const result: ClassGeneratorRecord = {};
  for (const key of Object.keys(object).reverse()) {
    result[key] = object[key];
  }

  return result;
}

/**
 * Classify field type to stricter kinds
 * @param val
 * @returns `ValidFieldType`
 */
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

/**
 * Nornalize type fix, skip on specific field type
 * @param fix
 * @param type
 * @returns
 */
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
