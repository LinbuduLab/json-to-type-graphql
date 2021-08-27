import jsonfile from "jsonfile";
import { BREAK, GraphQLScalarType } from "graphql";
import { capitalCase } from "capital-case";
import { Int } from "type-graphql";
import consola from "consola";
import util from "util";
import {
  DecoratorStructure,
  OptionalKind,
  Project,
  PropertyDeclarationStructure,
  Scope,
  SourceFile,
} from "ts-morph";
import fs from "fs-extra";
import prettier from "prettier";
import { addImportDeclaration, ImportType } from "./src/ast";
import intersection from "lodash/intersection";
import uniqBy from "lodash/uniqBy";
import remove from "lodash/remove";

// 重构：
// 移除无关依赖
// parser - 将 JSON 递归的解析为规定格式的对象
// generator - 从对象递归的生成 AST，并生成源码
// formatter - 格式化文件、移除无用导入、统一的添加注释

// json schema 2 ts?
// 卧槽，还要处理数组
// TODO: 结合 ObjectType 的配置
// TODO: ? 与 !
// TODO: 配置
// TODO: 在 formatter 里去掉没有使用到的装饰器
// rootClassName
// optional field
// apply ! to all field
// readonly field
// import all decorators
// public keyword
// apply ! to all list decorator types
// id field
// 'Type' suffix

// TODO: 配置选项
// rootClassName -> 最初创建的首个顶层 Class 名
// optional field -> 支持 "a.b.c" ?
// readonly field
// public -> 为所有字段增加 public 关键词
// suffix -> true "Type" string -> 这里就不capital了
// forceNonNullable -> 在对象类型数组中，强制将所有键设置为!
// 需要 () => String/Boolean 吗？
// TODO: 能力支持
// 支持仅 generator 或 仅 parser
// 支持从 请求 生成(by got?) -> 不内置支持
// TypeORM / Prisma 支持? 以后再说呗
// hooks register type processer

const content = jsonfile.readFileSync("./sample.json");

// 是不是可以直接返回数组形式

fs.rmSync("./testing.ts");
fs.createFileSync("./testing.ts");
const source = new Project().addSourceFileAtPath("./testing.ts");

addImportDeclaration(
  source,
  ["ObjectType", "Field", "Int", "ID"],
  "type-graphql",
  ImportType.NAMED_IMPORTS
);

function formatter() {}

// (async () => {
//   const res = await got(
//     "https://baas-all-demo.pre-fc.alibaba-inc.com/summary?ids=594572481181"
//   );

//   // console.log(res.body);
//   // parser(JSON.parse(res.body));
//   // generator(parser(JSON.parse(res.body)[0]));
//   // generator(parser(JSON.parse(res.body)));
//   // consola.log(
//   //   util.inspect(parser(JSON.parse(res.body)), {
//   //     depth: 999,
//   //   })
//   // );
// })();

// consola.log(
//   util.inspect(parser(content), {
//     depth: 999,
//   })
// );

// generator(
//   parser(content, { forceNonNullable: false, forceReturnType: false }),
//   {
//     entryClassName: "root",
//     publicProps: ["success"],
//   }
// );
