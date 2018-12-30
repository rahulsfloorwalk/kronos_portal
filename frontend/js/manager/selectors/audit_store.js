
export function findAuditStoreById(store, auditStoreId){
	return store.auditStores[auditStoreId];
}

export function findSummaryByAuditStoreId(store, auditStoreId){
	const auditStore = findAuditStoreById(store, auditStoreId);
	return auditStore ? auditStore.report_summary : "";
}