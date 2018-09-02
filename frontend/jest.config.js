module.exports = {
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
	reporters: [
		"default",
		["jest-junit", { output: "test_results/junit.xml"}],
	],
	clearMocks: true,
};
