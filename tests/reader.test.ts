import path from "path";
import fs from "fs-extra";
import { reader } from "../src/reader";

describe("should read content from various sources", () => {
  it("should throw when no options provided", async () => {
    await expect(reader()).rejects.toThrow("You must provide reader options!");
  });

  it("should throw when incorrect options provided", async () => {
    // @ts-ignore
    await expect(reader({ x: "xxx" })).rejects.toThrow(
      "You must provide oneof path/url/raw to get origin JSON content!"
    );
  });

  it("should read from JSON file", async () => {
    const raw = await reader({
      path: path.resolve(__dirname, "./fixtures/simple.json"),
    });

    expect(raw).not.toBeNull();
    expect(typeof raw).toBe("object");
    expect(Object.keys(raw).length).toBeGreaterThan(0);
  });

  it("should read from JSON file(array-entry)", async () => {
    const raw = await reader({
      path: path.resolve(__dirname, "./fixtures/array-entry.json"),
    });

    expect(raw).not.toBeNull();
    expect(Array.isArray(raw)).toBe(true);
    expect(raw.length).toBeGreaterThan(0);
  });

  it("should read from raw object", async () => {
    const data = {
      stringField: "linbudu",
      numberField: 599,
      booleanField: true,
    };

    expect(await reader({ raw: data })).toMatchObject(data);
  });

  it("should read from request", async () => {
    const fetched = await reader({
      url: "https://dog.ceo/api/breeds/image/random",
    });

    expect(fetched).toBeDefined();
    expect(typeof fetched).toBe("object");
    expect(typeof fetched.message).toBe("string");
    expect(typeof fetched.status).toBe("string");
  });
});
