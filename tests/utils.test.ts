import {
  capitalCase,
  ensureArray,
  reverseObjectKeys,
  strictTypeChecker,
  normalizeClassFix,
  normalizeTypeFix,
  ValidFieldType,
} from "../src/utils";

describe("should ensure utils!", () => {
  it("should transform to capitalCase", () => {
    expect(capitalCase("nested")).toBe("Nested");
    expect(capitalCase("nestedType")).toBe("NestedType");
  });

  it("should ensure array type", () => {
    expect(ensureArray(1)).toEqual([1]);
    expect(ensureArray([1])).toEqual([1]);
  });

  it("should reverse object keys", () => {
    expect(
      reverseObjectKeys({
        a: {
          info: {},
          parent: null,
          children: [],
          generated: true,
        },
        b: {
          info: {},
          parent: null,
          children: [],
          generated: true,
        },
        c: {
          info: {},
          parent: null,
          children: [],
          generated: true,
        },
      })
    ).toStrictEqual({
      c: {
        info: {},
        parent: null,
        children: [],
        generated: true,
      },
      b: {
        info: {},
        parent: null,
        children: [],
        generated: true,
      },
      a: {
        info: {},
        parent: null,
        children: [],
        generated: true,
      },
    });
  });

  it("should check type", () => {
    expect(strictTypeChecker("linbudu")).toBe(ValidFieldType.String);
    expect(strictTypeChecker(null)).toBe(ValidFieldType.Null);
    expect(strictTypeChecker(undefined)).toBe(ValidFieldType.Undefined);
    expect(strictTypeChecker(599)).toBe(ValidFieldType.Number);
    expect(strictTypeChecker(true)).toBe(ValidFieldType.Boolean);

    expect(strictTypeChecker([])).toBe(ValidFieldType.Empty_Array);
    expect(strictTypeChecker([1, 2, 3])).toBe(ValidFieldType.Primitive_Array);
    expect(strictTypeChecker([1, "2", true])).toBe(
      ValidFieldType.Primitive_Array
    );

    expect(strictTypeChecker({ foo: "bar" })).toBe(ValidFieldType.Object);
    expect(strictTypeChecker([{ foo: "bar" }, { foo: "bar" }])).toBe(
      ValidFieldType.Object_Array
    );
    expect(strictTypeChecker(Symbol("linbudu"))).toBe(ValidFieldType.Ignore);
  });

  it("should normalize class fix", () => {
    expect(normalizeClassFix(true, "foo")).toBe("foo");
    expect(normalizeClassFix("bar", "")).toBe("bar");
    expect(normalizeClassFix("bar", "foo")).toBe("bar");
    expect(normalizeClassFix(false, "foo")).toBe("");
    expect(normalizeClassFix(false, "")).toBe("");
  });

  it("should normalize type fix", () => {
    expect(normalizeTypeFix("foo", ValidFieldType.Boolean)).toBe("");
    expect(normalizeTypeFix("foo", ValidFieldType.String)).toBe("");
    expect(normalizeTypeFix("foo", ValidFieldType.Number)).toBe("");
    expect(normalizeTypeFix("foo", ValidFieldType.Primitive_Array)).toBe("");

    expect(normalizeTypeFix("foo", ValidFieldType.Empty_Array)).toBe("Foo");
    expect(normalizeTypeFix("foo", ValidFieldType.Object)).toBe("Foo");
    expect(normalizeTypeFix("foo", ValidFieldType.Object_Array)).toBe("Foo");
  });
});
