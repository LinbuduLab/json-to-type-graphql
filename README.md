# json-type-graphql

## Start

```bash
npm i json-type-graphql --save
yarn add json-type-graphql --save
pnpm i json-type-graphql --save
```

## Current Feature

This project is still under heavy development, the documentation is far from ready, but basic features are already supported:

- Nest object type generation.
- Normal generator order as `P-C1-C11-C12-C2-C21-C3-C31`.
- Fully customizable processing flow: reader -> preprocesser -> parser -> generator -> postprocessor -> writer
- ...

### Towards V 1.0

- [ ] Detailed Documentation
- [ ] Unit Test
- [ ] Features
  - [ ] Support full customizable.
  - [ ] Powerful postprocesser.
  - [ ] Better checker.
  - [ ] Basic AST utils to use.
  - [ ] Better control on field return type.
  - [ ] `buildSchemaSync` options for checker.

## Example

Generate TypeGraphQL class from JSON object:

> Run `yarn demo` to explore!

JSON:

```json
{
  "booleanField": true,
  "numberField": 200,
  "stringField": "success",
  "primitiveArrayField": [1, 2, 3, 4, 5],
  "mixedField": [
    1,
    2,
    {
      "a": "1111111"
    }
  ],
  "emptyArrayField": [],
  "nestedField": {
    "booleanField": true,
    "numberField": 200,
    "stringField": "success",
    "primitiveArrayField": [1, 2, 3, 4, 5],
    "mixedFieldrs": [1, 2]
  }
}
```

```typescript
(async () => {
  await transformer({
    reader: { path: path.join(__dirname, "./demo.json") },
    parser: {
      forceNonNullable: false,
      forceReturnType: false,
      forceNonNullableListItem: false,
    },
    generator: { entryClassName: "Root", sort: false },
    checker: {
      disable: false,
    },
    writter: {
      outputPath,
    },
  });
})();
```

> More options can be found in [utils.ts](./src/utils.ts)

generated:

```typescript
import { ObjectType, Field, Int, ID } from "type-graphql";

@ObjectType()
export class MixedField {
  @Field()
  a!: string;
}

@ObjectType()
export class EmptyArrayField {}

@ObjectType()
export class NestedField {
  @Field({ nullable: true })
  booleanField?: boolean;

  @Field((type) => Int, { nullable: true })
  numberField?: number;

  @Field({ nullable: true })
  stringField?: string;

  @Field((type) => [Int], { nullable: true })
  primitiveArrayField?: number[];

  @Field((type) => [Int], { nullable: true })
  mixedFieldrs?: number[];
}

@ObjectType()
export class Root {
  @Field({ nullable: true })
  booleanField?: boolean;

  @Field((type) => Int, { nullable: true })
  numberField?: number;

  @Field({ nullable: true })
  stringField?: string;

  @Field((type) => [Int], { nullable: true })
  primitiveArrayField?: number[];

  @Field((type) => [MixedField], { nullable: true })
  mixedField?: MixedField[];

  @Field((type) => [EmptyArrayField], { nullable: true })
  emptyArrayField?: EmptyArrayField[];

  @Field((type) => NestedField, { nullable: true })
  nestedField?: NestedField;
}
```

## Simple Documentation

### Reader

Reader handles content obtainment from JSON file / URL request / raw JavaScript object, you must provide at least one of `reader.path` / `reader.url` / `reader.raw` options.

#### Reader.Options

- `path`: **Absoulte** JSON file path.
- `url` & `options`: Using [got](https://www.npmjs.com/package/got) for data fetching like `got(url, options)`.
- `raw`: Plain JavaScript Object / Array.

After raw content is readed, it will be passed to `preprocesser`.

### Preprocesser

Preprocesser will perform some extra processing on the input content:

- Recursively **delete** object pairs which value is kind of **nested array** like `[[]]`, this is not supported yet which may also cause unexpected errors.
- Ensure array contains **either primitive values or object values**, only obejct values will be preserved when the array
  contains mixed members. You can control this behaviour by `preprocesser.preserveObjectOnlyInArray`.

#### Preprocesser.Options

- `preserveObjectOnlyInArray`: `default: true`
- `customPreprocesser`: Use your own custom preprocesser, which accepts `raw` from reader.

### Parser

Parser will transform the preprocessed raw content to specific object structure,
which will be consumed by `generator`.

Array entry structure(like `[]`) and object entry structure(like `{}`) will be parsed differently.

#### Parser.Options

- `forceNonNullable`: Mark all field as non-nullale. `default: true`
- `forceNonNullableListItem`: Mark all list item as non-nullale.`default: false`
- `forceReturnType`: Generate return type for even string / boolean / field like `@Field((type) => String)`. `default: false`
- `arrayEntryProp`: When parsing array-entry structure, use specified prop name like: `data: Data[]`. `default: 'data'`

> Custom parser is not supported now.

### Generator

Generator will traverse the parsed info record, perform corresponding AST operations to generate TypeGraphQL class-based types.

#### Generator.Options

- `entryClassName`: The top-level generated entry class name. `default: 'Root'`.
- `prefix`: Prefix for generated class name, you can set `prefix: true` to simply avoid repeated class specifier(by using parent class as child class name prefix, like `RootChildSomeChildProp` is from `Root-Child-SomeType`). `default: false`
- `suffix`: Suffix for generated class name. `default: false`.
- `publicProps`: Prop names included by it will be attatched with `public` keyword.
- `readonlyProps`: Prop names included by it will be attatched with `readonly` keyword.
- `sort`: Should sort generated class in normal order like `P-C1-C11-C12-C2-C21-C3-C31`. `default: true`.

### Postprocesser

Postprocesser is used to apply some post-processing works on generated source (`SourceFile`), you can use [ts-morph](https://ts-morph.com/) for simple and flexiable AST operations, which also powers the generator part.

#### Postprocesser.Options

- `customPostprocesser`: Custom post-processer accepts the source and perform extra options.

### Checker

Checker will use generated class to create a tmp reoslver, invoking `TypeGraphQL.buildSchemaSync` method to check does generated file work correctly.

Under the hood, we're using `ts-node tmp-file.ts --compiler-options [options]` to perform the check.

#### Checker.Options

- `disable`: Disable checker. `default: true`
- `keep`: Keey generated tmp checker file. `default: false`
- `execaOptions`: Extra options passed to [execa](https://www.npmjs.com/package/execa).
- `executeOptions`: Extra options passed to ts-node `--compiler-options`, which keeps same with TypeSctipt CompilerOptions.

### Writer

Writer will format generated source file, you can also use custom writer(coming soon).

#### Writer.options

- `outputPath`: Output path. required.
- `format`: Should perform formatting by `Prettier`.
- `formatOptions`: Options passed to `Prettier`.
