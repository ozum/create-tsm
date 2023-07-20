import { cp, lstat } from "node:fs/promises";
import { basename } from "node:path";
import { getTemplatePath } from "./utils.js";

const DONT_COPY = new Set(["package.json", "README.md", "LICENSE", ".eslintcache"]);

async function isConfigForTarget(src: string): Promise<boolean> {
  const stats = await lstat(src);
  const isNonRootDirectory = stats.isDirectory() && src !== getTemplatePath(".");
  const shouldSkip = isNonRootDirectory || DONT_COPY.has(basename(src));
  return !shouldSkip;
}

export default async function copyConfigs() {
  await Promise.all([
    cp(getTemplatePath("."), ".", { recursive: true, filter: isConfigForTarget, force: false }),
    cp(getTemplatePath(".github/workflows/tsm-build-and-test.yml"), ".github/workflows/tsm-build-and-test.yml", { force: false }),
    cp(getTemplatePath(".husky"), ".husky", { recursive: true, force: true }),
    cp(getTemplatePath("config"), "config", { recursive: true, force: true }),
  ]);
}
