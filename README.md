# JSON2TypeGraphQLClass

Generate TypeGraphQL Class From JSON!

感觉要重新梳理下？

- parser：根据不同的 field 类型提供不同的 parser
- generator：同样的，提供不同类型的 generator
- 先把所有的 field 都 parse 完毕，再递归的去 调用 generator 生成结构
- 需要传入 parentClass
