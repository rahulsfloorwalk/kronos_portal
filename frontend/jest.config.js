/* global module:false */

module.exports = {
	setupFiles: [
		"jest-prop-type-error",
	],
	setupFilesAfterEnv: [
		"./js/test_setup.js"
	],
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
			functions: 25,
			lines: 30,
			statements: 30,
		}
	},
	reporters: [
		"default",
		["jest-junit", { output: "test_results/junit.xml"}],
	],
	clearMocks: true,
	moduleNameMapper: {
		"\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/js/__mocks__/fileMock.js",
		"\\.(css|less|scss)$": "<rootDir>/js/__mocks__/styleMock.js"
	},
	"snapshotSerializers": ["enzyme-to-json/serializer"]
};
