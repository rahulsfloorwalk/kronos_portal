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

const createSampleStore = (namespace, auditCycleId, reportAttributes, selectedOptionIds) => {
	return {
		[namespace]: {
			reportAttributes: {
				[auditCycleId]: reportAttributes,
			},
			selectedOptionIds,
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

	describe("findSelectedOptionIdByAuditCycleIdAndJsonId", () => {
		const selectors = new ReportAttributeSelectors(namespace);
		const sampleJsonId = "4h43345kjj43n5n";
		const sampleOptionId = "87v4v3nbhjvhbf";
		const selectedOptionIds = {
			[sampleAuditCycleId]: {
				[sampleJsonId]: sampleOptionId,
			}
		};

		it("should return the selected option id for given audit cycle id and json id", () => {
			const sampleStore = createSampleStore(namespace, sampleAuditCycleId, sampleReportAttributes, selectedOptionIds);
			expect(selectors.findSelectedOptionIdByAuditCycleIdAndJsonId(sampleStore, sampleAuditCycleId, sampleJsonId)).toEqual(sampleOptionId);
		});

		it("should return undefined if there are no selected option for given audit cycle id", () => {
			const sampleStore = createSampleStore(namespace, sampleAuditCycleId, sampleReportAttributes, selectedOptionIds);
			expect(selectors.findSelectedOptionIdByAuditCycleIdAndJsonId(sampleStore, 56, "3465dsf345")).toBeUndefined();
		});

		it("should return undefined if there is no selected option for given audit cycle id and json id", () => {
			const sampleStore = createSampleStore(namespace, sampleAuditCycleId, sampleReportAttributes, selectedOptionIds);
			expect(selectors.findSelectedOptionIdByAuditCycleIdAndJsonId(sampleStore, sampleAuditCycleId, "3465dsf345")).toBeUndefined();
		});
	});
});
