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

function findReportAttributeByAuditCycleIdAndJsonId(store, auditCycleId, jsonId) {
	const reportAttributes = findReportAttributesByAuditCycleId(store, auditCycleId);
	return reportAttributes.find(ra => ra.json_id === jsonId);
}

export function findReportAttributeByAuditStoreIdAndJsonId(store, auditStoreId, jsonId){
	const auditStore = findAuditStoreById(store, auditStoreId);
	if(auditStore){
		return findReportAttributeByAuditCycleIdAndJsonId(store, auditStore.audit.audit_cycle.id, jsonId);
	} else {
		return undefined;
	}
}
