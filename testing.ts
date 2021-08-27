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
export class Ff {
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
