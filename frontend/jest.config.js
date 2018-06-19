module.exports = {
	setupTestFrameworkScriptFile: "./js/__tests__/setup.js",
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
	clearMocks: true,
};
