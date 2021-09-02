import { Project } from "ts-morph";
import tmp from "tmp";
import fs from "fs-extra";
import { postprocessor } from "../src/postprocessor";

describe.skip("should apply postprocess", () => {
  it("should use custom postprocessor", () => {
    const fn = jest.fn().mockImplementation((r) => {});
    const tmpFile = tmp.fileSync().name;

    fs.writeFileSync(tmpFile, "const foo = 'bar'");

    const source = new Project().addSourceFileAtPath(tmpFile);

    postprocessor(source, {
      customPostprocessor: fn,
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(source, {});
  });

  it("should skip when no custom postprocessor specified", () => {
    const tmpFile = tmp.fileSync().name;
    const source = new Project().addSourceFileAtPath(tmpFile);

    fs.writeFileSync(tmpFile, "const foo = 'bar'");

    postprocessor(source, {});

    // TODO: how do we know it's skipped?
  });
});
