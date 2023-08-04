import { cp, lstat } from "node:fs/promises";
import { basename, join } from "node:path";
import { type Answers } from "./get-answers.js";
import { getTemplatePath } from "./utils.js";

const DONT_COPY = new Set(["package.json", "README.md", "LICENSE", ".eslintcache"]);

async function isConfigForTarget(src: string): Promise<boolean> {
  const stats = await lstat(src);
  const isNonRootDirectory = stats.isDirectory() && src !== getTemplatePath(".");
  const shouldSkip = isNonRootDirectory || DONT_COPY.has(basename(src));
  return !shouldSkip;
}

export default async function copyConfigs(answers?: Answers) {
  const sourceGitHubWorkflowPath = answers?.useSharedGitHubWorkflow
    ? ".github/workflows/tsm-build-and-test.yml"
    : "config/tsm/tsm-build-and-test-independent.yml";

  await Promise.all([
    cp(getTemplatePath("."), ".", { recursive: true, filter: isConfigForTarget, force: false }),
    cp(getTemplatePath(".github/workflows/base-build-and-test.yml"), ".github/workflows/base-build-and-test.yml", { force: false }),
    cp(getTemplatePath(sourceGitHubWorkflowPath), join(".github/workflows", basename(sourceGitHubWorkflowPath)), { force: false }),
    cp(getTemplatePath(".husky"), ".husky", { recursive: true, force: true }),
    cp(getTemplatePath("config/tsm"), "config/tsm", { recursive: true, force: true }),
  ]);
}
