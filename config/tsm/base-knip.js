export default {
	ignore: ["src/@types/**", "src/bin/**", ".github/workflows/**"],
	ignoreDependencies: ["@vitest/coverage-v8"],
	ignoreBinaries: [], // auto (base-build-and-test.yml) falsely recognized as a binary.
	entry: ["src/index.ts", "src/bin"],
};
