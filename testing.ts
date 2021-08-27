import { ObjectType, Field, Int, ID } from "type-graphql";

@ObjectType()
export class Nested {
    @Field()
    name!: string;

    @Field((type) => Int)
    age!: number;

    @Field((type) => [Int])
    arrayField!: number[];
}

@ObjectType()
export class EmptyArrayField {
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
export class F {
    @Field((type) => Int)
    fa!: number;

    @Field((type) => Int)
    fb!: number;

    @Field((type) => Int)
    fc!: number;

    @Field((type) => [Int])
    fd!: number[];

    @Field((type) => Fe)
    fe!: Fe;
}

@ObjectType()
export class __TMP_CLASS_NAME__ {
    @Field()
    success!: boolean;

    @Field((type) => Int)
    status!: number;

    @Field()
    str!: string;

    @Field((type) => Nested)
    nested!: Nested;

    @Field((type) => [Int])
    arrayField!: number[];

    @Field((type) => [EmptyArrayField])
    emptyArrayField!: EmptyArrayField[];

    @Field((type) => [F])
    f!: F[];
}
