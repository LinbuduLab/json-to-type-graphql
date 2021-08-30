# json-type-graphql

> This project is still under heavy development, the documentation is far from ready, but basic features are already supported:
>
> - Nest object type generation
> - Normal generator order as `P-c1-C11-C12-C2-C21-C3-C31`
> - Customizable preprocesser
> - Control prop scope / readonly / optional
> - ...

## Start

```bash
npm i json-type-graphql --save
yarn add json-type-graphql --save
pnpm i json-type-graphql --save
```

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
import path from "path";
import fs from "fs-extra";
import jsonfile from "jsonfile";
import transformer from "..";

const outputPath = path.join(__dirname, "./generated.ts");

fs.existsSync(outputPath) && fs.rmSync(outputPath);

(async () => {
  await transformer(outputPath, {
    reader: { path: path.join(__dirname, "./demo.json") },
    parser: {
      forceNonNullableListItem: true,
    },
    generator: { entryClassName: "Root" },
  });
})();
```

generated:

```typescript
import { ObjectType, Field, Int, ID } from "type-graphql";

@ObjectType()
export class Root {
  @Field()
  booleanField!: boolean;

  @Field((type) => Int!)
  numberField!: number;

  @Field()
  stringField!: string;

  @Field((type) => [Int!]!)
  primitiveArrayField!: number[];

  @Field((type) => [MixedField!]!)
  mixedField!: MixedField[];

  @Field((type) => [EmptyArrayField!]!)
  emptyArrayField!: EmptyArrayField[];

  @Field((type) => NestedField!)
  nestedField!: NestedField;
}

@ObjectType()
export class MixedField {
  @Field()
  a!: string;
}

@ObjectType()
export class EmptyArrayField {}

@ObjectType()
export class NestedField {
  @Field()
  booleanField!: boolean;

  @Field((type) => Int!)
  numberField!: number;

  @Field()
  stringField!: string;

  @Field((type) => [Int!]!)
  primitiveArrayField!: number[];

  @Field((type) => [Int!]!)
  mixedFieldrs!: number[];
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
