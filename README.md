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
- Normal generator order as `P-c1-C11-C12-C2-C21-C3-C31`.
- Fully customizable processing flow: reader -> preprocesser -> parser -> generator -> postprocessor -> formatter -> writer
- ...

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

## Towards V 1.0

- [ ] Detailed Documentation
- [ ] Unit Test
- [ ] Features
  - [ ] Support post-processing
  - [ ] Performance
  - [ ] Support nested array
  - [ ] Powerful formatter
  - [ ] Better control on field return type
