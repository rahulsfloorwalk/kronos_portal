
import { findAuditStoreById, findSummaryByAuditStoreId } from "../audit_store";

describe(findAuditStoreById, () => {
	const sampleAuditStore = {
		id: 4,
		name: "Tralfamador",
	};
	it("should return the audit store with given id", () => {
		const sampleStore = {
			auditStores: {
				[sampleAuditStore.id]: sampleAuditStore,
			},
		};
		expect(findAuditStoreById(sampleStore, sampleAuditStore.id)).toEqual(sampleAuditStore);
	});

	it("should return undefined when a audit store with given id is not found", () => {
		const sampleStore = {
			auditStores: {},
		};
		expect(findAuditStoreById(sampleStore, 5)).toBeUndefined();
	});
});

describe("findSummaryByAuditStoreId", () => {
	const sampleAuditStore = {
		id: 4,
		report_summary: "Report Summary for audit store 4",
	};
	it("should return the audit store summary for the audit store with given id", () => {
		const sampleStore = {
			auditStores: {
				[sampleAuditStore.id]: sampleAuditStore,
			},
		};
		expect(findSummaryByAuditStoreId(sampleStore, sampleAuditStore.id)).toEqual("Report Summary for audit store 4");
	});

	it("should return blank string if audit store is not found", () => {
		const sampleStore = {
			auditStores: {
				[sampleAuditStore.id]: sampleAuditStore,
			},
		};
		expect(findSummaryByAuditStoreId(sampleStore, 1)).toEqual("");
	});
});
