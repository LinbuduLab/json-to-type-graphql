import fs from "fs-extra";
import jsonfile from "jsonfile";
import path from "path";
import got, { Options } from "got";

import { MaybeArray, ReaderOptions, SourceArray, SourceObject } from "./utils";

export async function reader(options?: ReaderOptions) {
  // Use Invariant
  if (!options) {
    throw new Error("You must provide reader options!");
  }

  if (options.path) return readFromFile(options.path);

  if (options.url) return await readFromRequest(options.url, options.options);

  if (options.raw) return options.raw;

  throw new Error(
    "You must provide oneof path/url/raw to get origin JSON content!"
  );
}

export function readFromFile(filePath: string) {
  return jsonfile.readFileSync(
    path.isAbsolute(filePath) ? filePath : path.resolve(filePath),
    { throws: true }
  );
}

export async function readFromRequest(url: string, options?: Options) {
  const res = await got(url, {
    responseType: "json",
    method: "GET",
    ...options,
  });
  return (res as { body: MaybeArray<SourceObject> | SourceArray }).body;
}
