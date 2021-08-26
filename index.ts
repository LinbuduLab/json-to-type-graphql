import jsonfile from "jsonfile";
import { Int } from "type-graphql";

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

const processed: Record<
  string,
  {
    type: "string" | "boolean" | "number";
    nested: boolean;
    prop: string;
    decoratorReturnType: any;
  }
> = {};

for (const [k, v] of Object.entries(content)) {
  console.log(k, v);

  switch (typeof v) {
    case "string":
    case "boolean":
      processed[k] = {
        type: typeof v as "string" | "boolean" | "number",
        nested: false,
        prop: k,
        decoratorReturnType: null,
      };

    case "number":
      processed[k] = {
        type: "number",
        nested: false,
        prop: k,
        decoratorReturnType: Int,
      };
  }
}
