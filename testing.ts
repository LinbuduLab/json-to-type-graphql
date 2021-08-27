import { ObjectType, Field, Int, ID } from "type-graphql";

@ObjectType()
export class NestedNestedNested {
    @Field()
    name!: string;
}

@ObjectType()
export class NestedNested {
    @Field()
    name!: string;

    @Field((type) => Int)
    arr!: number[];

    @Field((type) => NestedNestedNested)
    nested_nested_nested!: NestedNestedNested;
}

@ObjectType()
export class NestedAgain {
    @Field((type) => Int)
    nestedAgainIntKey!: number;

    @Field((type) => NestedNested)
    nested_nested!: NestedNested;
}

@ObjectType()
export class Nested {
    @Field()
    name!: string;

    @Field((type) => Int)
    age!: number;

    @Field((type) => Int)
    arrayField!: number[];

    @Field((type) => NestedAgain)
    nestedAgain!: NestedAgain;
}

@ObjectType()
export class __TMP_CLASS_NAME__ {
    @Field()
    success!: boolean;

    @Field((type) => Int)
    status!: number;

    @Field((type) => Nested)
    nested!: Nested;

    @Field((type) => Int)
    arrayField!: number[];
}
