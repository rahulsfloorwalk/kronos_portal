

import FilterSelectors from "../filter";

const sampleQuestionnaireType = {
	id: 45,
	name: "Python",
};

const sampleAuditCycle = {
	id: 1,
	name: "Desert Eagle",
	questionnaire_type: sampleQuestionnaireType,
};

const sampleReportAttributes = [
	{
		id: 1,
		json_id: "attribute1",
		label: "Label One",
		attribute_data: {
			version: 1,
			options: [
				{
					option_id: "option1",
					option_label: "Option Label 1",
				},
				{
					option_id: "option2",
					option_label: "Option Label 2",
				},
			],
		},
	},
	{
		id: 2,
		json_id: "attribute2",
		label: "Label Two",
		attribute_data: {
			version: 1,
			options: [
				{
					option_id: "option1",
					option_label: "Option Label 1",
				},
				{
					option_id: "option2",
					option_label: "Option Label 2",
				},
			],
		},
	},
];

const sampleReports = [
	{
		id: 1,
		audit_date: "2018-08-30",
		city_id: 1,
		city_name: "Nagpur",
		store_type: "Express",
		store_priority: "HIGH",
		attribute_data: {
			"attribute1": "option1",
		},
	},
	{
		id: 2,
		audit_date: "2018-08-26",
		city_id: 2,
		city_name: "Mumbai",
		store_type: "Slowmo",
		store_priority: "MEDIUM",
		attribute_data: {
			"attribute2": "option1",
		},
	},
	{
		id: 3,
		audit_date: "2018-08-28",
		city_id: 2,
		city_name: "Mumbai",
		store_type: "Slowmo",
		store_priority: "MEDIUM",
		attribute_data: {
			"attribute2": "option1",
		},
	},
];

describe("FilterSelectors", () => {
	const namespace = "foobar";
	let reportBrowserSelectors;
	let reportAttributeSelectors;
	let auditCycleSelectors;
	let selectors;

	beforeEach(() => {
		reportBrowserSelectors = {
			filterReports: jest.fn(),
			findSelectedOptionIdByJsonId: jest.fn(),
		};
		reportAttributeSelectors = {
			findReportAttributesBySelectedAuditCycle: jest.fn(),
		};
		auditCycleSelectors = {
			findSelectedAuditCycleBySelectedQuestionnaireType: jest.fn(),
		};
		selectors = new FilterSelectors(namespace, reportBrowserSelectors, reportAttributeSelectors, auditCycleSelectors);
	});

	describe("#filterReports", () => {
		it("should return filtered reports based on their attribute data", () => {
			auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType.mockReturnValue(sampleAuditCycle);
			reportBrowserSelectors.filterReports.mockReturnValue(sampleReports);
			reportAttributeSelectors.findReportAttributesBySelectedAuditCycle.mockReturnValue(sampleReportAttributes);

			reportBrowserSelectors.findSelectedOptionIdByJsonId
				.mockReturnValueOnce("option1")
				.mockReturnValueOnce(undefined);

			expect(selectors.filterReports({})).toEqual([sampleReports[0]]);
		});
		it("should return current filter state", () => {
			auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType.mockReturnValue(sampleAuditCycle);
			reportBrowserSelectors.filterReports.mockReturnValue(sampleReports);
			reportAttributeSelectors.findReportAttributesBySelectedAuditCycle.mockReturnValue(sampleReportAttributes);

			reportBrowserSelectors.findSelectedOptionIdByJsonId
				.mockReturnValueOnce("option1")
				.mockReturnValueOnce("option2")
				.mockReturnValueOnce(undefined);
			let expectedValue = {"attribute1": "option1", "attribute2": "option2"};

			expect(selectors.getFilterState({})).toEqual(expectedValue);
		});
		it("should return empty object", () => {
			auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType.mockReturnValue(sampleAuditCycle);
			reportBrowserSelectors.filterReports.mockReturnValue(sampleReports);
			reportAttributeSelectors.findReportAttributesBySelectedAuditCycle.mockReturnValue(sampleReportAttributes);

			reportBrowserSelectors.findSelectedOptionIdByJsonId
				.mockReturnValueOnce(undefined);
			let expectedValue = {};

			expect(selectors.getFilterState({})).toEqual(expectedValue);
		});
	});
});
