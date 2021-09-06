import { ObjectType, Field, Int, ID } from "type-graphql";

@ObjectType()
export class MixedField {
  @Field()
  a!: string;
}

@ObjectType()
export class EmptyArrayField {}

@ObjectType()
export class MixedField1 {
  @Field({ nullable: true })
  a111?: string;
}

@ObjectType()
export class C {
  @Field((type) => MixedField1, { nullable: true })
  mixedField1?: MixedField1;
}

@ObjectType()
export class MixedFieldrs {
  @Field()
  b!: string;

  @Field((type) => C!)
  c!: C;
}

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

  @Field((type) => [MixedFieldrs], { nullable: true })
  mixedFieldrs?: MixedFieldrs[];
}

@ObjectType()
export class Ff {}

@ObjectType()
export class Fec {
  @Field((type) => Int!)
  feca!: number;

  @Field()
  fecb!: boolean;

  @Field((type) => [String]!)
  fecc!: string[];
}

@ObjectType()
export class Fe {
  @Field((type) => Int, { nullable: true })
  fea?: number;

  @Field((type) => [Int], { nullable: true })
  feb?: number[];

  @Field((type) => [Fec], { nullable: true })
  fec?: Fec[];
}

@ObjectType()
export class F {
  @Field((type) => Int!)
  fa!: number;

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

  @Field((type) => [F], { nullable: true })
  f?: F[];
}
