import ReportAttributeSelectors from "../report_attribute";

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

const createSampleStore = (namespace, auditCycleId, reportAttributes) => {
	return {
		[namespace]: {
			reportAttributes: {
				[auditCycleId]: reportAttributes,
			},
		},
	};
};

describe("ReportAttributeSelectors", () => {
	const namespace = "foobar";

	describe("findReportAttributesByAuditCycleId", () => {
		const selectors = new ReportAttributeSelectors(namespace);
		it("should return all the report attributes for given audit cycle id", () => {
			const sampleStore = createSampleStore(namespace, sampleAuditCycleId, sampleReportAttributes);
			expect(selectors.findReportAttributesByAuditCycleId(sampleStore, sampleAuditCycleId)).toEqual(sampleReportAttributes);
		});

		it("should return an empty array if there are no report attributes for audit cycle id", () => {
			const sampleStore = createSampleStore(namespace, sampleAuditCycleId, sampleReportAttributes);
			const anotherAuditCycleId = 5;
			expect(selectors.findReportAttributesByAuditCycleId(sampleStore, anotherAuditCycleId)).toEqual([]);
		});
	});
});
