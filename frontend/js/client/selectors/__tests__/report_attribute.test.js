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

	describe("findReportAttributesBySelectedAuditCycle", () => {
		let auditCycleSelectors;

		beforeEach(() => {
			auditCycleSelectors = {
				findSelectedAuditCycleBySelectedQuestionnaireType: jest.fn(),
			};
		});
		const sampleJsonId = "4h43345kjj43n5n";
		const sampleOptionId = "87v4v3nbhjvhbf";
		const selectedOptionIds = {
			[sampleAuditCycleId]: {
				[sampleJsonId]: sampleOptionId,
			}
		};

		it("should return the report attributes for the selected audit cycle", () => {
			auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType.mockReturnValue({id: sampleAuditCycleId});
			const selectors = new ReportAttributeSelectors(namespace, auditCycleSelectors);
			const sampleStore = createSampleStore(namespace, sampleAuditCycleId, sampleReportAttributes, selectedOptionIds);
			expect(selectors.findReportAttributesBySelectedAuditCycle(sampleStore)).toEqual(sampleReportAttributes);
		});

		it("should return empty array if there are no report attributes for the selected audit cycle", () => {
			auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType.mockReturnValue({id: 50});
			const selectors = new ReportAttributeSelectors(namespace, auditCycleSelectors);
			const sampleStore = createSampleStore(namespace, sampleAuditCycleId, sampleReportAttributes, sampleReportAttributes);
			expect(selectors.findReportAttributesBySelectedAuditCycle(sampleStore)).toEqual([]);
		});
	});
});
