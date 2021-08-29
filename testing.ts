import { ObjectType, Field, Int, ID } from "type-graphql";

@ObjectType()
export class TmpClassNameMixedField {
  @Field()
  a!: string;
}

@ObjectType()
export class TmpClassNameEmptyArrayField {}

@ObjectType()
export class TmpClassNameNestedFieldMixedFieldCMixedField {
  @Field()
  a111!: string;
}

@ObjectType()
export class TmpClassNameNestedFieldMixedFieldC {
  @Field((type) => TmpClassNameNestedFieldMixedFieldCMixedField!)
  mixedField!: TmpClassNameNestedFieldMixedFieldCMixedField;
}

@ObjectType()
export class TmpClassNameNestedFieldMixedField {
  @Field()
  b!: string;

  @Field((type) => TmpClassNameNestedFieldMixedFieldC!)
  c!: TmpClassNameNestedFieldMixedFieldC;
}

@ObjectType()
export class TmpClassNameNestedField {
  @Field()
  booleanField!: boolean;

  @Field((type) => Int!)
  numberField!: number;

  @Field()
  stringField!: string;

  @Field((type) => [Int!]!)
  primitiveArrayField!: number[];

  @Field((type) => [TmpClassNameNestedFieldMixedField!]!)
  mixedField!: TmpClassNameNestedFieldMixedField[];
}

@ObjectType()
export class TmpClassNameFFf {}

@ObjectType()
export class TmpClassNameFFeFec {
  @Field((type) => Int!)
  feca!: number;

  @Field()
  fecb!: boolean;

  @Field()
  fecc!: string[];
}

@ObjectType()
export class TmpClassNameFFe {
  @Field((type) => Int!)
  fea!: number;

  @Field((type) => [Int!]!)
  feb!: number[];

  @Field((type) => [TmpClassNameFFeFec!]!)
  fec!: TmpClassNameFFeFec[];
}

@ObjectType()
export class TmpClassNameF {
  @Field((type) => Int, { nullable: true })
  fa?: number;

  @Field((type) => Int, { nullable: true })
  fb?: number;

  @Field((type) => Int, { nullable: true })
  fc?: number;

  @Field((type) => [Int!], { nullable: true })
  fd?: number[];

  @Field((type) => [TmpClassNameFFf!], { nullable: true })
  ff?: TmpClassNameFFf[];

  @Field((type) => TmpClassNameFFe, { nullable: true })
  fe?: TmpClassNameFFe;
}

@ObjectType()
export class __TMP_CLASS_NAME__ {
  @Field()
  booleanField!: boolean;

  @Field((type) => Int!)
  numberField!: number;

  @Field()
  stringField!: string;

  @Field((type) => [Int!]!)
  primitiveArrayField!: number[];

  @Field((type) => [TmpClassNameMixedField!]!)
  mixedField!: TmpClassNameMixedField[];

  @Field((type) => [TmpClassNameEmptyArrayField!]!)
  emptyArrayField!: TmpClassNameEmptyArrayField[];

  @Field((type) => TmpClassNameNestedField!)
  nestedField!: TmpClassNameNestedField;

  @Field((type) => [TmpClassNameF!]!)
  f!: TmpClassNameF[];
}
