import { writter } from "../src/writter";
import fs from "fs-extra";
import prettier from "prettier";
import tmp from "tmp";

let tmpFile: string;

beforeEach(() => {
  tmpFile = tmp.fileSync().name;
  fs.writeFileSync(tmpFile, "const a:string = 'linbudu'");
});

describe("should handle write and format", () => {
  it("should throw on no output path specified", () => {
    // @ts-ignore
    expect(() => writter({})).toThrow("writer.outputPath is required!");
    // @ts-ignore
    expect(() => writter({ outputPath: null })).toThrow(
      "writer.outputPath is required!"
    );
  });

  it("should write", () => {
    const rfs = jest
      .spyOn(fs, "readFileSync")
      .mockReturnValue("const a:string = 'linbudu'");
    const wfs = jest.spyOn(fs, "writeFileSync").mockReturnValue();

    writter({ outputPath: tmpFile, formatOptions: { singleQuote: true } });

    expect(rfs).toBeCalledTimes(1);
    expect(rfs).toBeCalledWith(tmpFile, "utf-8");

    expect(wfs).toBeCalledTimes(1);
    expect(wfs).toBeCalledWith(tmpFile, "const a:string = 'linbudu'");
  });

  it("should disable format", () => {
    const formatter = jest.spyOn(prettier, "format");
    writter({ outputPath: tmpFile, format: false });

    expect(formatter).not.toBeCalled();

    writter({ outputPath: tmpFile, format: true });

    expect(formatter).toBeCalledTimes(1);

    expect(formatter).toBeCalledWith("const a:string = 'linbudu'", {
      parser: "typescript",
      tabWidth: 2,
    });
  });
});
