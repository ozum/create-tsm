import { spawn } from "node:child_process";
import { generateLicenseFile } from "generate-license-file";
import copyConfigs from "./copy-configs.js";
import { createOrUpdatePackageJson } from "./package-json.js";
import { type Answers } from "./get-answers.js";
import { getTemplatePath } from "./utils.js";

export async function generate(answers?: Answers): Promise<void> {
  if (getTemplatePath(".") === process.cwd()) throw new Error("Source and destination paths are same.");
  const [needsInstall] = await Promise.all([createOrUpdatePackageJson(answers), copyConfigs()]);
  if (needsInstall) spawn("swpm", ["install"], { stdio: "inherit" });
  await generateLicenseFile("./package.json", "./LICENSE");
  console.info(`Package ${answers ? `created:${answers.packageName}` : "updated"}`);
}
