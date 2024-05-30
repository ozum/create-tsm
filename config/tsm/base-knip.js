export default {
  ignore: ["src/@types/**", "src/bin/**", ".eslintrc-maximum.cjs"],
  ignoreDependencies: ["@types/jest", "@jest/globals", "audit-ci"],
  ignoreBinaries: ["auto"], // auto (base-build-and-test.yml) falsely recognized as a binary.
  entry: ["src/index.ts", "src/bin"],
};
