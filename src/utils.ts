import { sep, join, extname, dirname } from "node:path";
import { mkdir, lstat, writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import pretier from "prettier";
import author from "user-meta";
import { Octokit } from "@octokit/rest";
import { Answers } from "./get-answers.js";
import { createRepositorySecret } from "./create-repo-secret.js";

export function getTemplatePath(filePath: string): string {
  const templateRoot = dirname(fileURLToPath(import.meta.url));
  return join(templateRoot, "..", filePath);
}

export async function getTemplateContent(filePath: string): Promise<string> {
  return readFile(getTemplatePath(filePath), "utf8");
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    return (error as { code: string }).code !== "ENOENT";
  }
}

export async function writePrettyFile(path: string, content: string, overwrite = false): Promise<void> {
  const ext = extname(path);

  await mkdir(dirname(path), { recursive: true }); // make sure the path exists

  if (!ext) return writeFile(path, `${content}\n`);

  const parser = { ".js": "babel", ".json": "json", ".md": "markdown", ".ts": "typescript", ".yml": "yaml" }[ext];

  if (!parser) throw new Error(`Define parser for ${path}`);
  if (!overwrite && (await fileExists(path))) return undefined;
  return writeFile(path, await pretier.format(content, { parser }));
}

/**
 * Filter object entries from given object without mutating the original object.
 *
 * @param data is the object to remove keys from.
 * @param filter is the filter function returning boolean to decide which entries to remove.
 * @param transform is the transform function returning a new value to transform the object.
 * @returns new object.
 */
export function transformObject<T extends Record<string, unknown>, K extends keyof T>(
  data: T | undefined,
  {
    filter = () => true,
    transform = (k, v) => [k, v],
  }: { filter?: (key: K, val: T[K]) => boolean; transform?: (key: K, val: T[K]) => [K, T[K]] },
): Partial<T> {
  if (data === undefined) return {};
  return Object.fromEntries(
    Object.entries(data)
      .filter(([k, v]) => filter(k as K, v as T[K]))
      .map(([k, v]) => transform(k as K, v as T[K])),
  ) as unknown as Partial<T>;
}

export function getDefaultPackageName(): string {
  const [parentDir, dir] = process.cwd().split(sep).slice(-2);
  return parentDir.startsWith("@") ? `${parentDir}/${dir}` : dir;
}

export function getDefaultAuthor(gitUserName?: string): { name: string; email: string; url: string } {
  return {
    name: author.name ?? "",
    email: author.email ?? "",
    url: author.url ?? (gitUserName ? `https://github.com/${gitUserName}` : ""),
  };
}

export function parseJsonSafe(input?: unknown): Record<string, string> | string {
  if (typeof input !== "string") return "";
  try {
    return JSON.parse(input) as Record<string, string>;
  } catch {
    return input;
  }
}

export async function createNpmTokenSecret(octokit: Octokit, answers: Answers): Promise<void> {
  if (!answers.gitUser || !answers.npmToken) throw new Error("Git user and npm token are required to create NPM_TOKEN secret.");

  const {
    data: { key_id: keyId, key },
  } = await octokit.rest.actions.getRepoPublicKey({ owner: answers.gitUser.username, repo: answers.repoName });

  const secret = await createRepositorySecret(key, answers.npmToken);

  await octokit.rest.actions.createOrUpdateRepoSecret({
    owner: answers.gitUser.username,
    repo: answers.repoName,
    secret_name: "NPM_TOKEN",
    encrypted_value: secret,
    key_id: keyId,
  });

  console.info("Secret added to repository: NPM_TOKEN");
}
