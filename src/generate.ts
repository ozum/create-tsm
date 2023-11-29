import { spawn } from "node:child_process";
import copyConfigs from "./copy-configs.js";
import { createOrUpdatePackageJson } from "./package-json.js";
import { type Answers } from "./get-answers.js";
import { getTemplatePath, createLicenseFile } from "./utils.js";

export async function generate(answers?: Answers): Promise<void> {
  if (getTemplatePath(".") === process.cwd()) throw new Error("Source and destination paths are same.");
  const [needsInstall] = await Promise.all([createOrUpdatePackageJson(answers), copyConfigs(answers), createLicenseFile(answers)]);
  if (needsInstall) spawn("npx", ["swpm", "install"], { stdio: "inherit" });
  console.info(`Package ${answers ? `created:${answers.packageName}` : "updated"}`);
}
