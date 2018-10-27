
import {
	findReportAttributesByAuditCycleId,
	findReportAttributesByAuditStoreId,
	findReportAttributeByAuditStoreIdAndJsonId,
} from "../report_attribute";

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
		json_id: "foobar1",
	},
	{
		id: 8,
		label: "Shirley",
		json_id: "foobar2",
	},
	{
		id: 9,
		label: "Euphemia",
		json_id: "foobar3",
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

describe(findReportAttributeByAuditStoreIdAndJsonId, () => {
	it("should return the report attribute with the given audit store id and json id", () => {
		const sampleStore = {
			auditStores: {
				[sampleAuditStore.id]: sampleAuditStore,
			},
			reportAttributes: {
				[sampleAuditCycle.id]: sampleReportAttributes,
			},
		};
		expect(findReportAttributeByAuditStoreIdAndJsonId(sampleStore, sampleAuditStore.id, "foobar1")).toEqual(sampleReportAttributes[0]);
	});

	it("should return undefined when there is no report attribute with the given audit store id and json id", () => {
		const sampleStore = {
			auditStores: {
				[sampleAuditStore.id]: sampleAuditStore,
			},
			reportAttributes: {
				[sampleAuditCycle.id]: sampleReportAttributes,
			},
		};
		expect(findReportAttributeByAuditStoreIdAndJsonId(sampleStore, sampleAuditStore.id, "foobar4")).toEqual(undefined);
	});

	it("should return undefined when there is no audit store with the given id", () => {
		const sampleStore = {
			auditStores: {},
			reportAttributes: {
				[sampleAuditCycle.id]: sampleReportAttributes,
			},
		};
		expect(findReportAttributeByAuditStoreIdAndJsonId(sampleStore, 4, "foobar4")).toEqual(undefined);
	});
});

