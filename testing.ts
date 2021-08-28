import { ObjectType, Field, Int, ID } from "type-graphql";

@ObjectType()
export class __TMP_CLASS_NAME__ {
  @Field()
  booleanField!: boolean;

  @Field((type) => Int)
  numberField!: number;

  @Field()
  stringField!: string;

  @Field((type) => [Int])
  primitiveArrayField!: number[];

  @Field((type) => [MixedField])
  mixedField!: MixedField[];

  @Field((type) => [EmptyArrayField])
  emptyArrayField!: EmptyArrayField[];

  @Field((type) => NestedField)
  nestedField!: NestedField;

  @Field((type) => [F])
  f!: F[];
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

  @Field((type) => Int)
  numberField!: number;

  @Field()
  stringField!: string;

  @Field((type) => [Int])
  primitiveArrayField!: number[];

  @Field((type) => [MixedNestedField])
  mixedNestedField!: MixedNestedField[];
}

@ObjectType()
export class MixedNestedField {
  @Field()
  a!: string;
}

@ObjectType()
export class F {
  @Field((type) => Int, { nullable: true })
  fa?: number;

  @Field((type) => Int, { nullable: true })
  fb?: number;

  @Field((type) => Int, { nullable: true })
  fc?: number;

  @Field((type) => [Int], { nullable: true })
  fd?: number[];

  @Field((type) => [Ff], { nullable: true })
  ff?: Ff[];

  @Field((type) => Fe, { nullable: true })
  fe?: Fe;
}

@ObjectType()
export class Ff {}

@ObjectType()
export class Fe {
  @Field((type) => Int)
  fea!: number;

  @Field((type) => [Int])
  feb!: number[];

  @Field((type) => [Fec])
  fec!: Fec[];
}

@ObjectType()
export class Fec {
  @Field((type) => Int)
  feca!: number;

  @Field()
  fecb!: boolean;

  @Field()
  fecc!: string[];
}
