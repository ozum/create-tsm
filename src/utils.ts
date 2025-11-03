import { exec } from "node:child_process";
import { lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import type { Octokit } from "@octokit/rest";
import author from "user-meta";
import { createRepositorySecret } from "./create-repo-secret.js";
import type { Answers } from "./get-answers.js";

const execAsync = promisify(exec);

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

export async function writePrettyFile(
	path: string,
	content: string,
	overwrite = false,
): Promise<void> {
	const ext: string = extname(path);

	await mkdir(dirname(path), { recursive: true }); // make sure the path exists

	if (!overwrite && (await fileExists(path))) return;

	await writeFile(path, `${content}\n`);

	if (!ext) return;

	try {
		await execAsync(`npx biome check --write ${path}`);
	} catch (error) {
		console.error("Biome exited with an error:", error);
	}
}

/**
 * Filter object entries from given object without mutating the original object.
 *
 * @param data is the object to remove keys from.
 * @param filter is the filter function returning boolean to decide which entries to remove.
 * @param transform is the transform function returning a new value to transform the object.
 * @returns new object.
 */
export function transformObject<
	T extends Record<string, unknown>,
	K extends keyof T,
>(
	data: T | undefined,
	{
		filter = () => true,
		transform = (k, v) => [k, v],
	}: {
		filter?: (key: K, val: T[K]) => boolean;
		transform?: (key: K, val: T[K]) => [K, T[K]];
	},
): Partial<T> {
	if (data === undefined) return {};
	return Object.fromEntries(
		Object.entries(data)
			.filter(([k, v]) => filter(k as K, v as T[K]))
			.map(([k, v]) => transform(k as K, v as T[K])),
	) as unknown as Partial<T>;
}

/**
 * Gets monorepo name from directory name if project is a monorepo. Currently supports:
 * - Turbo Repo
 */
function getMonoRepoName(): string | undefined {
	const [monoRepoDir, parentDir] = process.cwd().split(sep).slice(-3);
	return parentDir === "packages" || parentDir === "apps"
		? monoRepoDir
		: undefined;
}

/**
 * Gets node package's scope name if it is a scoped package.
 */
function getPackageScope(): string | undefined {
	const pathArray = process.cwd().split(sep);
	const scopeDir = getMonoRepoName() ? pathArray.at(-4) : pathArray.at(-2);
	return scopeDir?.startsWith("@") ? scopeDir : undefined;
}

export function getDefaultPackageName(): string {
	const pathArray = process.cwd().split(sep);
	const dir = pathArray.at(-1) as string;
	const packageScope = getPackageScope();
	return packageScope ? `${packageScope}/${dir}` : dir;
}

export function getDefaultRepoName(packageName: string): string {
	const packageNameWithoutScope = packageName.split("/").pop() as string;
	return getMonoRepoName() ?? packageNameWithoutScope;
}

export function getDefaultAuthor(gitUserName?: string): {
	name: string;
	email: string;
	url: string;
} {
	return {
		name: author.name ?? "",
		email: author.email ?? "",
		url: author.url ?? (gitUserName ? `https://github.com/${gitUserName}` : ""),
	};
}

/**
 * Returns repository name.
 *
 * @param repository is the URL or JSON string.
 * @returns if input is a JSON string parses and returns `url` value, otherwise returns the string as is.
 *
 * @example
 * getRepoName('{ "type":"git","url":"https://github.com/ozum/my-repo" }'); // my-repo
 * getRepoName(https://github.com/ozum/my-repo'); // my-repo
 */
export function getRepoName(repository: string): string {
	const repo = parseJsonSafe(repository);
	const url = (typeof repo === "object" ? repo.url : repo) as string;
	const name = url.split("/").pop();
	if (name === undefined)
		throw new Error(`Cannot determine repo name from ${repository}`);
	return name;
}

export function parseJsonSafe(
	input?: unknown,
): Record<string, string> | string {
	if (typeof input !== "string") return "";
	try {
		return JSON.parse(input) as Record<string, string>;
	} catch {
		return input;
	}
}

export async function createNpmTokenSecret(
	octokit: Octokit,
	answers: Answers,
): Promise<void> {
	if (!answers.gitUser || !answers.npmToken)
		throw new Error(
			"Git user and npm token are required to create NPM_TOKEN secret.",
		);

	const {
		data: { key_id: keyId, key },
	} = await octokit.rest.actions.getRepoPublicKey({
		owner: answers.gitUser.username,
		repo: answers.repoName,
	});

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

/**
 * Gets license text for the given license type, author and year.
 *
 * @param license is the type of license. (isc, mit, etc.)
 * @param authorName is the name of the author
 * @param year is the year of the license.
 * @returns license text.
 */
async function getLicense(
	license: string,
	authorName = "The Author",
	year = new Date().getFullYear(),
): Promise<string> {
	const response = await fetch(`https://api.github.com/licenses/${license}`);
	const licenseText = ((await response.json()) as { body?: string }).body;
	const yearText = year.toString();

	if (licenseText === undefined)
		return `© ${yearText} ${authorName}. All Rights Reserved.`;

	return licenseText
		.replaceAll("[year]", yearText)
		.replaceAll("[yyyy]", yearText)
		.replaceAll("<year>", yearText)
		.replaceAll("[name of copyright owner]", authorName)
		.replaceAll("[fullname]", authorName)
		.replaceAll("<name of author>", authorName);
}

/**
 * Writes license text for the given license type to the LICENSE file.
 *
 * @param license is the type of license. (isc, mit, etc.)
 * @param authorName is the name of the author
 * @param year is the year of the license.
 */
export async function createLicenseFile(answers?: Answers): Promise<void> {
	if (!answers) return;
	const authorName =
		typeof answers.author === "object" ? answers.author.name : answers.author;
	const licenseText = await getLicense(answers.license, authorName);
	await writeFile("LICENSE", licenseText);
}
