# Description

Highly opinionated and customizable boilerplate for creating and **updating** TypeScript modules.

No need to install anything. Just use your package manager.

Creates your project and provides automatic verification, push and release scripts.

# Usage

## Create

```sh
$ mkdir my-project
$ NPM_TOKEN=xyz123 GITHUB_TOKEN=xyz123 npm init @ozum/tsm@latest
```

It will ask your package manager. You can select **`npm`, `pnpm` or `yarn`** even you started script with `npm init`.

## Update (Experimental)

```sh
$ npx @ozum/create-tsm@latest
```

- Updates `package.json` dependencies and base scripts starting with `base:`.
- Updates files in `.husky`, `, `config/tsm`.
- Adds new configs to the root if any available.
- Does **NOT** change/update configs in the root directory.
- Does **NOT** change/update github workflows.

# Features

- Supports **`npm`, `pnpm` and `yarn`**.
- Creates `package.json` with necessary `devDependencies` and development related `scripts`.
- Allows you to use up to date [shared GitHub workflow](https://github.com/ozum/create-tsm/blob/main/.github/workflows/base-build-and-test.yml) or the workflow at the time of initialization. (Based on answer to the `use shared GitHub workflow` question)
- Updates existing `package.json`, base configurations and base scripts. Does not touch derived scripts and configurations.
  - Writes `package.json` if only it is changed.
  - Executes install if only dependencies has changed.
- Creates `package.json` scripts prefixed with with `base:`, so you can customize yours without risking future updates.
- Where possible, creates base scripts in `config/tsm` directory, so, you can customize yours without risking future updates.
- Provides [reusable GitHub workflow](https://docs.github.com/en/actions/using-workflows/reusing-workflows).
- **(Optional)** Creates a GitHub repository.
- **(Optional)** Adds `NPM_TOKEN` secret to the created repository.
- Never stores the security tokens.
- Creates a GitHub workflow for CI/CD which utilizes [`Semantic Release`](https://semantic-release.gitbook.io/semantic-release/)
- Let's GitHub Workflow verify (test, lint, build, audit) and publish the npm package.
- Has very strict ESLint rules, but can be customized.
- Configures and supports many tools out of the box. No configs needed.
  - [ESLint](https://eslint.org/) with three configurations. (`ozum`, `ozum-minimum`, `ozum-maximum`). See [eslint-config-ozum](https://www.npmjs.com/package/eslint-config-ozum)
  - [Prettier](https://prettier.io/)
  - [EditorConfig](https://editorconfig.org/)
  - [Commitizen](http://commitizen.github.io/cz-cli/)
  - [commitlint](https://commitlint.js.org/)
  - [Jest](https://jestjs.io/)
  - [Knip](https://github.com/webpro/knip)
  - [Lint Staged](https://github.com/okonet/lint-staged)
  - [TypeDoc](https://typedoc.org/)
  - [GitHub Actions](https://docs.github.com/en/actions)
  - [Husky](https://typicode.github.io/husky/)
  - [swpm](https://github.com/deinsoftware/swpm)
  - [semantic-release](https://semantic-release.gitbook.io/semantic-release)
- Generates LICENSE file.

## Scripts

Below are `package.json` scripts generated and their default behavior. Scripts started with **`base:`** should not be changed by the user, because they will be overwritten during update.

| name       | EU                       | description                                                                                                                                                                                                                                                                                                                                                                      |
| ---------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| verify     | :smiley:                 | Tests and check lint, audit, format and dependencies of the project.                                                                                                                                                                                                                                                                                                             |
| release    | :smiley:                 | <ul style="padding-left:15px"><li>Verifies your project</li><li>Commits & pushes the project to the GitHub</li><li>Ensures your commit message is [conventional](https://www.conventionalcommits.org/)</li><li>Lets GitHub CI/CD release your package to the NPM with correct version number using [semantic-release](https://semantic-release.gitbook.io/semantic-release)</li> |
| test       | :smiley:                 | Tests the project.                                                                                                                                                                                                                                                                                                                                                               |
| dev        | :question:               | Starts build process in `watch` mode.                                                                                                                                                                                                                                                                                                                                            |
| lint       | :question:               | Lints and fixes errors when possible.                                                                                                                                                                                                                                                                                                                                            |
| format     | :question:               | Formats the files.                                                                                                                                                                                                                                                                                                                                                               |
| build      | :question:               | Builds your project.                                                                                                                                                                                                                                                                                                                                                             |
| docs:api   | :question:               | Builds API docs with [TypeDoc](https://typedoc.org/).                                                                                                                                                                                                                                                                                                                            |
| commit     | :heavy_exclamation_mark: | Executes `git commit` with [Commitizen](http://commitizen.github.io/cz-cli/), but you don't need to use it, because [Husky](https://typicode.github.io/husky/) catches `git commit`.                                                                                                                                                                                             |
| commitlint | :heavy_exclamation_mark: | Executes tasks for [commitlint](https://commitlint.js.org/).                                                                                                                                                                                                                                                                                                                     |
| precommit  | :heavy_exclamation_mark: | Executes [Lint Staged](https://github.com/okonet/lint-staged) tasks and verifications.                                                                                                                                                                                                                                                                                           |
| prepare    | :heavy_exclamation_mark: | Ensures [Husky](https://typicode.github.io/husky/) is installed.                                                                                                                                                                                                                                                                                                                 |

| Legend                   | Purpose        | Description                                                                      |
| ------------------------ | -------------- | -------------------------------------------------------------------------------- |
| :smiley:                 | For end user   | Should be used by the end user in a normal workflow.                             |
| :question:               | Occasional use | Used by end user occasionally when needed.                                       |
| :heavy_exclamation_mark: | Special need   | Normally not used by en user. Only needed for customization or special purposes. |

## No Monorepo Support

[TurboRepo](https://turbo.build/repo) is a great tool for monorepos and easy to learn and start. However, I examined several tools and solutions, but couldn't find **easy** way to publish multiple packages using `Semantic Release` with mono repos.

I'm open to suggestions for mono-repo support if solution is

- Easy to setup for end users
- Easy to maintain for end users
- Unobtrusive
- Robust
- Widely supported

# (Optional) GitHub Access Token Permissions

Optionally, this boilerplate can create a GitHub repository and add `NPM_TOKEN` secret. It is advised to create fine-grained personal access tokens for increased security to limit actions. You can create fine-grained access tokens [here](https://github.com/settings/personal-access-tokens/new).

- Administration: Read and write (To create GitHub repository)
- Metadata: Read only (Mandated by GitHub)
- Secrets: Read and write (This is **OPTIONAL** and used to add `NPM_TOKEN`)

# FAQ

**Q:** How to customize `package.json` scripts?<br/>
**A:** All scripts are divided into `base` and `normal`. Add your custom tasks to the normal scripts without changing the `base:` scripts. For example: `{ "verify": "my-task && swpm run base:verify" }`

**Q:** How to change or remove coverage thresholds of the tests?<br/>
**A:** Add `jest.config.js` the following: ` coverageThreshold: { global: { branches: 0, functions: 0, lines: 0, statements: 0 } }`

**Q:** How to disable tests?<br/>
**A:** Change `test` script in `package.json` as similar to `{ "test": "echo No tests are available. Skipping testing step." }`
