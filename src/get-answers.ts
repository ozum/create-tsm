import inquirer from "inquirer";
import askName from "inquirer-npm-name";
import type { PackageJson } from "type-fest";
import readGitUser from "read-git-user";
import { getDefaultPackageName, getDefaultAuthor, parseJsonSafe, getDefaultRepoName } from "./utils.js";

export interface Answers {
  packageName: string;
  packageManager: "npm" | "pnpm" | "yarn" | "yarn@berry";
  useSharedGitHubWorkflow: boolean;
  description: string;
  repository: PackageJson["repository"];
  githubToken?: string;
  npmToken?: string;
  keywords: PackageJson["keywords"];
  author?: PackageJson["author"];
  license: string;
  repoName: string;
  gitUser?: { username: string; email: string };
}

export async function getAnswers(): Promise<Answers> {
  const gitUser = await readGitUser();

  const packageNameAnswer = await askName(
    {
      name: "packageName",
      message: "package name",
      default: getDefaultPackageName(),
    },
    inquirer,
  );

  const questions = [
    {
      type: "list",
      name: "packageManager",
      message: "package manager",
      choices: ["npm", "pnpm", "yarn", "yarn@berry"],
      default: "npm",
    },
    {
      type: "confirm",
      name: "useSharedGitHubWorkflow",
      message: "use shared GitHub workflow",
      default: true,
    },
    {
      type: "input",
      name: "description",
    },
    {
      type: "input",
      name: "repository",
      message: "repository",
      default: JSON.stringify({
        type: "git",
        url: `https://github.com/${gitUser.username}/${getDefaultRepoName(packageNameAnswer.packageName)}`,
      }),
    },
    {
      type: "input",
      name: "githubToken",
      message: "github personal access token (optional)",
      default: process.env.GITHUB_TOKEN,
    },
    {
      type: "input",
      name: "npmToken",
      description: "NPM token (optional)",
      default: process.env.NPM_TOKEN,
      when: (answers: Record<string, unknown>) => answers.githubToken,
    },
    {
      type: "input",
      name: "keywords",
    },
    {
      type: "input",
      name: "author",
      default: JSON.stringify(getDefaultAuthor(gitUser.username)),
    },
    {
      type: "input",
      name: "license",
      default: "ISC",
    },
  ];

  const answers = await inquirer.prompt(questions);

  return {
    ...packageNameAnswer,
    ...answers,
    author: parseJsonSafe(answers.author),
    repository: parseJsonSafe(answers.repository),
    npmToken: answers.npmToken ?? undefined,
    githubToken: answers.githubToken ?? undefined,
    keywords: (answers.keywords as string).split(/\s*,\s*/),
    repoName: (answers.repository as string).split("/").pop(), // https:/.../ozum/my-project -> my-project
    gitUser,
  } as Answers;
}
