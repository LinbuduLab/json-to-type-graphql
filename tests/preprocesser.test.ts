import {
  preprocessor,
  preserveObjectTypeInArrayOnly,
  preservePrimitiveTypeInArrayOnly,
} from "../src/preprocessor";

const objectOnlyArray = [{ foo: "bar" }];
const primitiveOnlyArray = [1, 2, 3, 4];
const mixedPrimitiveOnlyArray = [1, "linbudu", true];
const mixedArray = [...objectOnlyArray, ...primitiveOnlyArray];

describe.skip("should process raw content", () => {
  it("should preserve object only", () => {
    expect(preserveObjectTypeInArrayOnly(objectOnlyArray)).toStrictEqual(
      objectOnlyArray
    );

    expect(preserveObjectTypeInArrayOnly(primitiveOnlyArray)).toStrictEqual([]);
    expect(
      preserveObjectTypeInArrayOnly(mixedPrimitiveOnlyArray)
    ).toStrictEqual([]);
    expect(preserveObjectTypeInArrayOnly(mixedArray)).toStrictEqual(
      objectOnlyArray
    );
  });

  it("should primitive member only", () => {
    expect(preservePrimitiveTypeInArrayOnly(objectOnlyArray)).toStrictEqual([]);

    expect(preservePrimitiveTypeInArrayOnly(primitiveOnlyArray)).toStrictEqual(
      primitiveOnlyArray
    );
    expect(
      preservePrimitiveTypeInArrayOnly(mixedPrimitiveOnlyArray)
    ).toStrictEqual(mixedPrimitiveOnlyArray);
    expect(preservePrimitiveTypeInArrayOnly(mixedArray)).toStrictEqual(
      primitiveOnlyArray
    );
  });

  it("should use cutom preprocessor if specified", () => {
    const fn = jest.fn().mockImplementation((r) => r);
    const raw = { foo: "bar" };

    preprocessor(raw, {
      preserveObjectOnlyInArray: true,
      customPreprocessor: fn,
    });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(raw, { preserveObjectOnlyInArray: true });
  });

  it("should process array source", () => {
    expect(
      preprocessor(mixedArray, { preserveObjectOnlyInArray: true })
    ).toStrictEqual(objectOnlyArray);

    expect(
      preprocessor(mixedArray, { preserveObjectOnlyInArray: false })
    ).toStrictEqual(primitiveOnlyArray);
  });

  it("should process object", () => {
    expect(
      preprocessor(
        {
          foo: {
            foo1: [["foo"]],
            foo2: "bar",
            foo3: [],
          },
        },
        { preserveObjectOnlyInArray: true }
      )
    ).toStrictEqual({
      foo: {
        foo2: "bar",
        foo3: [],
      },
    });

    expect(
      preprocessor(
        {
          foo: {
            foo1: "foo",
            foo2: "bar",
            foo3: [],
          },
        },
        { preserveObjectOnlyInArray: true }
      )
    ).toStrictEqual({
      foo: {
        foo1: "foo",
        foo2: "bar",
        foo3: [],
      },
    });

    expect(
      preprocessor(
        {
          foo: {
            foo1: "foo",
            foo2: "bar",
            foo3: {
              foo3arr: [],
              foo3nestedarr: [[]],
            },
          },
        },
        { preserveObjectOnlyInArray: true }
      )
    ).toStrictEqual({
      foo: {
        foo1: "foo",
        foo2: "bar",
        foo3: {
          foo3arr: [],
        },
      },
    });

    expect(preprocessor([], { preserveObjectOnlyInArray: true })).toStrictEqual(
      []
    );

    expect(
      preprocessor(
        {
          foo: {
            foo1: "foo",
            foo2: "bar",
            foo3: {
              foo3arr: ["foo", "bar"],
              foo3nestedarr: [[]],
              foo3mixedarr: [{ a: 1 }, "foo", "bar"],
            },
          },
        },
        { preserveObjectOnlyInArray: true }
      )
    ).toStrictEqual({
      foo: {
        foo1: "foo",
        foo2: "bar",
        foo3: {
          foo3arr: ["foo", "bar"],
          foo3mixedarr: [{ a: 1 }],
        },
      },
    });

    expect(
      preprocessor(
        {
          foo: {
            foo1: "foo",
            foo2: "bar",
            foo3: {
              foo3arr: ["foo", "bar"],
              foo3nestedarr: [[]],
              foo3mixedarr: [{ a: 1 }, "foo", "bar"],
            },
          },
        },
        { preserveObjectOnlyInArray: false }
      )
    ).toStrictEqual({
      foo: {
        foo1: "foo",
        foo2: "bar",
        foo3: {
          foo3arr: ["foo", "bar"],
          foo3mixedarr: ["foo", "bar"],
        },
      },
    });
  });
});
