// Eslint generates warning, which cannot be surpassed, if a staged file to be linted is in ignored files list.
// Git ignored files are not present in staged files already. So use `--no-ignore` instead of `--ignore-path .gitignore`
const check = "biome check --staged --no-errors-on-unmatched";
const test = "vitest related --coverage --passWithNoTests";

export default {
	"*.{jsx,tsx,vue,js,ts,json,less,css,md,gql,graphql,html,yaml,yml}": [check],
	"src/**/*.{js,ts}": [test],
};
