export default {
  ignore: ["src/@types", ".eslintrc-maximum.cjs"],
  ignoreBinaries: ["audit-ci", "base:commitlint"],
  entry: ["src/index.ts", "src/bin"],
};
