# json-type-graphql

Generate TypeGraphQL class from JSON object:

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

transformer(content, outputPath, { generator: { entryClassName: "Root" } });
```

generated:

```typescript
import { ObjectType, Field, Int, ID } from "type-graphql";

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
```

## Towards V 1.0

- [ ] Detailed Documentation
- [ ] Unit Test
- [ ] Features
  - [ ] Support post-processing
  - [ ] Performance
  - [ ] Support nested array
  - [ ] Powerful formatter
