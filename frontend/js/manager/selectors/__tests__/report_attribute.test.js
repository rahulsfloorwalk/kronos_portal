
import { findReportAttributesByAuditCycleId, findReportAttributesByAuditStoreId } from "../report_attribute";

const sampleAuditCycle = {
	id: 7,
	name: "Slartibartfast",
};

const sampleAuditStore = {
	id: 4,
	name: "Tralfamador",
	audit: {
		id: 6,
		audit_cycle: sampleAuditCycle,
	},
};
const sampleReportAttributes = [
	{
		id: 7,
		label: "Kururugi",
	},
	{
		id: 8,
		label: "Shirley",
	},
	{
		id: 9,
		label: "Euphemia",
	},
];

describe(findReportAttributesByAuditCycleId, () => {
	it("should return the report attributes for the given audit cycle id", () => {
		const sampleStore = {
			reportAttributes: {
				[sampleAuditCycle.id]: sampleReportAttributes,
			},
		};
		expect(findReportAttributesByAuditCycleId(sampleStore, sampleAuditCycle.id)).toEqual(sampleReportAttributes);
	});

	it("should return an empty array when there are no report attributes for a given audit cycle id", () => {
		const sampleStore = {
			reportAttributes: {},
		};
		expect(findReportAttributesByAuditCycleId(sampleStore, 5)).toEqual([]);
	});
});


describe(findReportAttributesByAuditStoreId, () => {

	it("should return the report attributes for the given audit store id", () => {
		const sampleStore = {
			auditStores: {
				[sampleAuditStore.id]: sampleAuditStore,
			},
			reportAttributes: {
				[sampleAuditCycle.id]: sampleReportAttributes,
			},
		};
		expect(findReportAttributesByAuditStoreId(sampleStore, sampleAuditStore.id)).toEqual(sampleReportAttributes);
	});

	it("should return an empty array when a audit store with given id does not exist", () => {
		const sampleStore = {
			auditStores: {},
			reportAttributes: {},
		};
		expect(findReportAttributesByAuditStoreId(sampleStore, 5)).toEqual([]);
	});
});
