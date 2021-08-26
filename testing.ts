import { ObjectType, Field, Int, ID } from "type-graphql";

@ObjectType()
export class Nested {
    @Field()
    public name!: string;

    @Field((type) => Int)
    public age!: number;
}

@ObjectType()
export class __TMP_CLASS_NAME__ {
    @Field()
    public success!: boolean;

    @Field((type) => Int)
    public status!: number;

    @Field((type) => Nested)
    public nested!: Nested;
}
