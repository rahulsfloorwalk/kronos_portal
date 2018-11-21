

export function findAuditsByAuditCycleId(store, auditCycleId){
	return Object.values(store.audits).filter(a => a.audit_cycle.id === auditCycleId);
}

export function findAuditById(store, auditId){
	return Object.values(store.audits).find(a => a.id === auditId);
}
