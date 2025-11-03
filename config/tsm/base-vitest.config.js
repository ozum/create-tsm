const ignorePatterns = ["<rootDir>/dist/", "<rootDir>/node_modules/"];

export default {
	coverage: {
		exclude: ignorePatterns,
		thresholds: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
	},
};
