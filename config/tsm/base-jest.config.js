/**
 * For `@swc/jest` use `config.swc`.
 * For `ts-node` use `config.tsNode` and change `scripts.test` in `package.json` to `NODE_OPTIONS=--experimental-vm-modules jest --coverage`
 */

const ignorePatterns = ["<rootDir>/dist/", "<rootDir>/node_modules/"];

const config = {
  swc: {
    transform: { "^.+\\.(t|j)sx?$": "@swc/jest" },
    extensionsToTreatAsEsm: [".ts", ".tsx"],
  },
  tsNode: {
    transform: { "^.+\\.tsx?$": ["ts-jest", { useESM: true }] },
    preset: "ts-jest/presets/default-esm",
  },
};

export default {
  moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" },
  coveragePathIgnorePatterns: ignorePatterns,
  testPathIgnorePatterns: ignorePatterns,
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  ...config.swc,
};
