
import { findAuditStoreById } from "../audit_store";

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
