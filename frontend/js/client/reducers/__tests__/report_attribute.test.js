import { FETCH_REPORT_ATTRIBUTES } from "../../action_types";
import { fetchReportAttributesByAuditCycleId } from "../report_attribute";

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
