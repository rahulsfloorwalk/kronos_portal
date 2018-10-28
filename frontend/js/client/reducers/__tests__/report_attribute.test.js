import {FETCH_REPORT_ATTRIBUTES, SELECT_REPORT_ATTRIBUTE_OPTION} from "../../action_types";
import reportAttributeReducer, { fetchReportAttributesByAuditCycleId } from "../report_attribute";

const sampleAuditCycleId = 1;
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

describe("reportAttributeReducer", () => {

	it("gets the initial state", () => {
		const reportAttributes = reportAttributeReducer(undefined, {});
		expect(reportAttributes).toEqual({
			reportAttributes: {},
			selectedOptionIds: {},
		});
	});

	describe(FETCH_REPORT_ATTRIBUTES, () => {
		it("sets the reportAttributes", () => {
			const store = reportAttributeReducer(undefined, {
				type: FETCH_REPORT_ATTRIBUTES,
				reportAttributes: sampleReportAttributes,
				auditCycleId: sampleAuditCycleId,
			});
			expect(store).toEqual({
				reportAttributes: {
					[sampleAuditCycleId]: sampleReportAttributes
				},
				selectedOptionIds: {},
			});
		});
	});

	describe(SELECT_REPORT_ATTRIBUTE_OPTION, () => {
		it("selects the given option id the given audit cycle id and json id", () => {
			const sampleJsonId = sampleReportAttributes[1].json_id;
			const selectedOptionId = sampleReportAttributes[1].attribute_data.options[1].option_id;

			const store = reportAttributeReducer(undefined, {
				type: SELECT_REPORT_ATTRIBUTE_OPTION,
				auditCycleId: sampleAuditCycleId,
				jsonId: sampleJsonId,
				optionId: selectedOptionId,
			});

			expect(store).toEqual({
				reportAttributes: {},
				selectedOptionIds: {
					[sampleAuditCycleId]: {
						[sampleJsonId]: selectedOptionId,
					},
				},
			});
		});
	});
});

describe("fetchReportAttributesByAuditCycleId", () => {
	it("it returns an action to fetch report attributes by audit cycle id", () => {
		const action = fetchReportAttributesByAuditCycleId(sampleAuditCycleId, sampleReportAttributes);

		expect(action).toEqual({
			type: FETCH_REPORT_ATTRIBUTES,
			reportAttributes: sampleReportAttributes,
			auditCycleId: sampleAuditCycleId,
		});
	});
});
