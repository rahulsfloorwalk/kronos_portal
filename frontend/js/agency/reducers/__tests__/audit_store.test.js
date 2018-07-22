
import { findAuditStore } from "../audit_store.js";

describe("findAuditStore", () => {
	const sampleStore = {
		auditStores: [
			{
				id: 1,
			},
		],
	};

	it("it finds the auditStore from the store", () => {
		expect(findAuditStore(sampleStore, 1)).toEqual(sampleStore.auditStores[0]);
	});

	it("it returns undefined when the auditStore is not found", () => {
		expect(findAuditStore(sampleStore, 2)).toBeUndefined();
	});
});
