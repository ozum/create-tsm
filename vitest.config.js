import config from "./config/tsm/base-vitest.config.js";

export default {
	...config,
	thresholds: {
		branches: 100,
		functions: 100,
		lines: 100,
		statements: 100,
	},
};
