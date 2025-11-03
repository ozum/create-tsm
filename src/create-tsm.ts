#!/usr/bin/env node
import { Octokit } from "@octokit/rest";
import { simpleGit } from "simple-git";
import { generate } from "./generate.js";
import { getAnswers } from "./get-answers.js";
import { createNpmTokenSecret, fileExists } from "./utils.js";

export async function createTSM() {
	const answers = (await fileExists("package.json"))
		? undefined
		: await getAnswers();

	if (answers?.repoName && answers.gitUser && answers.githubToken) {
		const octokit = new Octokit({ auth: answers.githubToken });
		const git = simpleGit();
		const result = await octokit.rest.repos.createForAuthenticatedUser({
			name: answers.repoName,
		});

		console.info(
			`Repository created: https://github.com/${result.data.full_name}`,
		);

		if (answers.npmToken) await createNpmTokenSecret(octokit, answers);

		await git.init();
		await git.branch(["-M", "main"]);
		await git.addRemote(
			"origin",
			`https://github.com/${answers.gitUser.username}/${answers.repoName}.git`,
		);

		console.info("Git initialized with Main branch.");
	}

	await generate(answers);
}
