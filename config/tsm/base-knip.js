export default {
  ignore: ["src/@types", ".eslintrc-maximum.cjs"],
  ignoreBinaries: ["audit-ci", "auto"], // auto (base-build-and-test.yml) falsely recognized as a binary.
  entry: ["src/index.ts", "src/bin"],
};
