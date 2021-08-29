import { ObjectType, Field, Int, ID } from "type-graphql";

@ObjectType()
export class __TMP_CLASS_NAME__ {
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
