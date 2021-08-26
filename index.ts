import jsonfile from "jsonfile";
import { GraphQLScalarType } from "graphql";
import { capitalCase } from "capital-case";
import { Int } from "type-graphql";
import consola from "consola";
import util from "util";

// json schema 2 ts?

// { success: true, status: 500 }
const content = jsonfile.readFileSync("./sample.json");
console.log("content: ", content);

// 预期：
// className 来自于 配置
// fields
//   nested: boolean
//   type: "string" | "boolean" | "number"
//   prop

// 处理时：
// 对于 nested 为 false 直接添加
// @Field(() => decoratorReturnType)
// prop: type
// 对于 nested 为 true
// 添加
// @Field(() => `capitalize(prop)${Type}`)
// prop: `capitalize(prop)${Type}`
// 额外创建一个 classname 为 `capitalize(prop)${Type}` 的递归处理

// parse
// generate & hook
// output

// TODO:
// Morpher Creator Support
// Generate from request
// Custom Config！

// 检查是不是真的 object
type PossibleFieldType =
  | "string"
  | "boolean"
  | "number"
  | "object"
  | string
  | PlainObject;

type PlainObject = Record<string, unknown>;

type OriginObject = Record<string, PossibleFieldType>;

type ProcessedFieldInfo = {
  type: PossibleFieldType;
  nested: boolean;
  prop: string;
  decoratorReturnType: GraphQLScalarType | string | null;
  fields?: Record<string, ProcessedFieldInfo>;
};

function parser(content: OriginObject): Record<string, ProcessedFieldInfo> {
  const parsedFieldInfo: Record<string, ProcessedFieldInfo> = {};

  for (const [k, v] of Object.entries(content)) {
    // use Object.toString.call
    switch (typeof v) {
      case "string":
      case "boolean":
        parsedFieldInfo[k] = {
          type: typeof v as "string" | "boolean" | "number",
          nested: false,
          prop: k,
          decoratorReturnType: null,
        };

        break;

      case "number":
        parsedFieldInfo[k] = {
          type: "number",
          nested: false,
          prop: k,
          decoratorReturnType: "Int",
        };

        break;

      case "object":
        parsedFieldInfo[k] = {
          type: capitalCase(k),
          nested: true,
          prop: k,
          decoratorReturnType: capitalCase(k),
          fields: parser(content[k] as OriginObject),
        };
        break;
    }
  }

  return parsedFieldInfo;
}

consola.log(
  util.inspect(parser(content), {
    depth: 999,
  })
);
