import type { PackageJson } from "type-fest";
import { readFile } from "node:fs/promises";
import { deepEqual } from "fast-equals";
import { whichPackageManager } from "which-package-manager";
import { getTemplateContent, writePrettyFile, fileExists, transformObject } from "./utils.js";
import { type Answers } from "./get-answers.js";

const SOURCE_ONLY_DEV_DEPS = new Set(["type-fest", "@types/inquirer", "@types/inquirer-npm-name", "@types/libsodium-wrappers"]);

function getScripts(scripts: PackageJson.Scripts = {}): { prefixedScripts: PackageJson.Scripts; targetedScripts: PackageJson.Scripts } {
  const prefixedScripts = transformObject(scripts, { filter: (k) => k.startsWith("base:") });
  const targetedScripts = transformObject(prefixedScripts, { transform: (k) => [k.replace("base:", ""), `swpm run ${k}`] });
  return { prefixedScripts, targetedScripts };
}

function getDependencies(dependencies: PackageJson.Dependency | undefined = {}, ignore = new Set<string>()): PackageJson.Dependency {
  return transformObject(dependencies, {
    filter: (key) => !ignore.has(key),
    transform: (key, value) => [key, value?.replace("^", "")], // "^1.0.0" => "1.0.0". Target package.json should not update boilerplate devDependencies. It should break development tasks.
  });
}

/**
 * Creates target package.json file.
 *
 * @param answers is the answers gathered from the user.
 * @returns whether package.json file needs to be installed, which is always true for newly created package.json.
 */
async function createPackageJson(answers: Answers): Promise<boolean> {
  const sourcePackage = JSON.parse(await getTemplateContent("package.json")) as PackageJson;
  const { prefixedScripts, targetedScripts } = getScripts(sourcePackage.scripts);

  const pkg = {
    name: answers.packageName,
    version: "0.0.0",
    description: answers.description,
    type: "module",
    publishConfig: { access: "public" },
    release: { branches: ["main"] },
    exports: "./dist",
    types: "dist/index.d.ts",
    files: ["dist"],
    swpm: answers.packageManager,
    scripts: { ...targetedScripts, ...prefixedScripts },
    repository: answers.repository,
    bugs: { url: `https://github.com/${answers.gitUser?.username}/${answers.repoName}/issues` },
    homepage: `https://github.com/${answers.gitUser?.username}/${answers.repoName}`,
    keywords: answers.keywords,
    author: answers.author,
    license: answers.license,
    dependencies: {},
    devDependencies: {
      ...getDependencies(sourcePackage.devDependencies, SOURCE_ONLY_DEV_DEPS),
      swpm: sourcePackage.dependencies?.swpm?.replace("^", ""),
    },
  };

  await writePrettyFile("package.json", JSON.stringify(pkg));
  return true;
}

/**
 * Updates target package.json file and checks whether it needs to be installed.
 *
 * @returns whether package.json file needs to be installed.
 */
async function updatePackageJson(): Promise<boolean> {
  const sourcePackage = JSON.parse(await getTemplateContent("package.json")) as PackageJson;
  const targetPackageBefore = JSON.parse(await readFile("./package.json", "utf8")) as PackageJson;
  const targetPackage = JSON.parse(await readFile("./package.json", "utf8")) as PackageJson;
  const { prefixedScripts, targetedScripts } = getScripts(sourcePackage.scripts);

  targetPackage.scripts = { ...targetedScripts, ...targetPackage.scripts, ...prefixedScripts };
  targetPackage.devDependencies = {
    ...targetPackage.devDependencies,
    ...getDependencies(sourcePackage.devDependencies, SOURCE_ONLY_DEV_DEPS),
    swpm: sourcePackage.dependencies?.swpm?.replace("^", ""),
  };

  targetPackage.swpm = targetPackage.swpm ?? (await whichPackageManager()) ?? "npm";

  const isEqual = deepEqual(targetPackageBefore, targetPackage);
  const isDepsEqual =
    deepEqual(targetPackageBefore.dependencies, targetPackage.dependencies) &&
    deepEqual(targetPackageBefore.devDependencies, targetPackage.devDependencies) &&
    deepEqual(targetPackageBefore.peerDependencies, targetPackage.peerDependencies) &&
    deepEqual(targetPackageBefore.optionalDependencies, targetPackage.optionalDependencies);

  if (!isEqual) await writePrettyFile("package.json", JSON.stringify(targetPackage), true);
  return !isDepsEqual;
}

/**
 * Creates or updates target package.json file and checks whether it needs to be installed.
 *
 * @returns whether package.json file needs to be installed.
 */
export async function createOrUpdatePackageJson(answers?: Answers): Promise<boolean> {
  const targetPackageExists = await fileExists("package.json");
  if (targetPackageExists) return updatePackageJson();
  if (answers === undefined) throw new Error("Answers are required to create package.json");
  return createPackageJson(answers);
}
