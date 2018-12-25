
import { rootReducer } from "../../reducers";

import types from "../../action_types";

describe(types.REPORT_SECTION_GET, () => {
	const actionType = types.REPORT_SECTION_GET;
	describe("when status is request", () => {
		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "request",
			});
		});
		it("it clears the reportSections", () => {
			expect(nextState.reportSections).toEqual({});
		});
	});

	describe("when status is success", () => {
		const sampleReportSections = [
			{
				id: 1,
				question_id: 1,
				marks_obtained: 1,
			},
			{
				id: 2,
				question_id: 2,
				marks_obtained: 1,
			},
		];

		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "success",
				reportSections: sampleReportSections,
			});
		});

		it("converts a list of reportSections into an object", () => {
			expect(nextState.reportSections).toEqual({
				[sampleReportSections[0].id]: sampleReportSections[0],
				[sampleReportSections[1].id]: sampleReportSections[1],
			});
		});
	});
});

describe(types.REPORT_SECTION_COMMENT, () => {
	const actionType = types.REPORT_SECTION_COMMENT;
	describe("when status is success", () => {
		const sampleReportSection = {
			id: 2,
			section_id: 2,
			marks_obtained: 1,
		};

		let nextState;
		beforeEach(() => {
			nextState = rootReducer(undefined, {
				type: actionType,
				status: "success",
				reportSection: sampleReportSection,
			});
		});

		it("sets the reportSection at it's ID", () => {
			expect(nextState.reportSections[sampleReportSection.id]).toEqual(sampleReportSection);
		});
	});
});
