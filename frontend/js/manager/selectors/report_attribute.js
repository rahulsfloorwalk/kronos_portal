import { findAuditStoreById } from "./audit_store";

export function findReportAttributesByAuditCycleId(store, auditCycleId){
	return store.reportAttributes[auditCycleId] || [];
}

export function findReportAttributesByAuditStoreId(store, auditStoreId){
	const auditStore = findAuditStoreById(store, auditStoreId);
	if(auditStore){
		return findReportAttributesByAuditCycleId(store, auditStore.audit.audit_cycle.id);
	} else {
		return [];
	}
}
