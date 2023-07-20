# Description

Highly opinionated and customizable boilerplate for creating and **updating** TypeScript modules.

No need to install anything. Just use your package manager.

# Usage

## Create

**npm**

```sh
$ mkdir my-project
$ NPM_TOKEN=xyz123 GITHUB_TOKEN=xyz123 npm init @ozum/tsm
```

**pnpm**

```sh
$ mkdir my-project
$ NPM_TOKEN=xyz123 GITHUB_TOKEN=xyz123 pnpm create @ozum/tsm
```

## Update

# Features

- Creates `package.json` with necessary `devDependencies` and development related `scripts`.
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

## What it doesn't

- It does **NOT** support mono repos. (I couldn't find an easy way to publish multiple packages using `Semantic Release`)

# (Optional) GitHub Access Token Permissions

Optionally, this boilerplate can create a GitHub repository and add `NPM_TOKEN` secret. It is advised to create fine-grained personal access tokens for increased security to limit actions. You can create fine-grained access tokens [here](https://github.com/settings/personal-access-tokens/new).

- Administration: Read and write (To create GitHub repository)
- Metadata: Read only (Mandated by GitHub)
- Secrets: Read and write (This is **OPTIONAL** and used to add `NPM_TOKEN`)
