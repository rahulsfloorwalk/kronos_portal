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
			branches: 17,
			functions: 17,
			lines: 20,
			statements: 20,
		}
	},
	reporters: [
		"default",
		["jest-junit", { output: "test_results/junit.xml"}],
	],
	clearMocks: true,
	moduleNameMapper: {
		"\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/js/__mocks__/fileMock.js",
		"\\.(css|less|scss)$": "<rootDir>/js/__mocks__/styleMock.js",
		"^libheif-js$": "<rootDir>/__mocks__/libheif-js.js"
	},
	"snapshotSerializers": ["enzyme-to-json/serializer"],
};
