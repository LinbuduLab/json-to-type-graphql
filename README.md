# json-type-graphql

Generate TypeGraphQL class from JSON object:

> Using [demo.ts](demo.ts) & [demo.json](demo.json):

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
import transformer from "./src";

const outputPath = path.join(__dirname, "./generated.ts");

const content = jsonfile.readFileSync("./demo.json");

fs.existsSync(outputPath) && fs.rmSync(outputPath);

transformer(content, outputPath, {
  parser: {
    forceNonNullableListItem: true,
  },
  generator: { entryClassName: "Root" },
});
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
