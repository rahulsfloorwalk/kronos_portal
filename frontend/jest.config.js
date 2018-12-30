module.exports = {
	setupFiles: [
		"jest-prop-type-error",
	],
	setupTestFrameworkScriptFile: "./js/test_setup.js",
	testPathIgnorePatterns: [
		"./js/__tests__/setup.js",
	],
	collectCoverageFrom: [
		"js/**/*.{js,jsx}",
	],
	coverageReporters: [
		"text",
		"html",
	],
	coverageThreshold: {
		global: {
			branches: 29,
			functions: 30,
			lines: 25,
			statements: 25,
		}
	},
	reporters: [
		"default",
		["jest-junit", { output: "test_results/junit.xml"}],
	],
	clearMocks: true,
};
