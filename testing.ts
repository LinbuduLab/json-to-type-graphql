import { ObjectType, Field, Int, ID } from "type-graphql";

@ObjectType()
export class __TMP_CLASS_NAME__ {
  @Field()
  booleanField!: boolean;

  @Field((type) => Int!)
  numberField!: number;

  @Field()
  stringField!: string;

  @Field((type) => [Int]!)
  primitiveArrayField!: number[];

  @Field((type) => [MixedFieldType]!)
  mixedField!: MixedFieldType[];

  @Field((type) => [EmptyArrayFieldType!]!)
  emptyArrayField!: EmptyArrayFieldType[];

  @Field((type) => NestedFieldType!)
  nestedField!: NestedFieldType;

  @Field((type) => [FType]!)
  f!: FType[];
}

@ObjectType()
export class MixedFieldType {
  @Field()
  a!: string;
}

@ObjectType()
export class EmptyArrayFieldType {}

@ObjectType()
export class NestedFieldType {
  @Field()
  booleanField!: boolean;

  @Field((type) => Int!)
  numberField!: number;

  @Field()
  stringField!: string;

  @Field((type) => [Int]!)
  primitiveArrayField!: number[];

  @Field((type) => [MixedFieldrsType]!)
  mixedFieldrs!: MixedFieldrsType[];
}

@ObjectType()
export class MixedFieldrsType {
  @Field()
  b!: string;

  @Field((type) => CType!)
  c!: CType;
}

@ObjectType()
export class CType {
  @Field((type) => MixedField1Type!)
  mixedField1!: MixedField1Type;
}

@ObjectType()
export class MixedField1Type {
  @Field()
  a111!: string;
}

@ObjectType()
export class FType {
  @Field((type) => Int, { nullable: true })
  fa?: number;

  @Field((type) => Int, { nullable: true })
  fb?: number;

  @Field((type) => Int, { nullable: true })
  fc?: number;

  @Field((type) => [Int], { nullable: true })
  fd?: number[];

  @Field((type) => [FfType!], { nullable: true })
  ff?: FfType[];

  @Field((type) => FeType, { nullable: true })
  fe?: FeType;
}

@ObjectType()
export class FfType {}

@ObjectType()
export class FeType {
  @Field((type) => Int!)
  fea!: number;

  @Field((type) => [Int]!)
  feb!: number[];

  @Field((type) => [FecType]!)
  fec!: FecType[];
}

@ObjectType()
export class FecType {
  @Field((type) => Int!)
  feca!: number;

  @Field()
  fecb!: boolean;

  @Field()
  fecc!: string[];
}
