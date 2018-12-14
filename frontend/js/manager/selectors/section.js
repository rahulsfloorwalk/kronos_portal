
export const findSectionsByAuditCycleId = (store, auditCycleId) => {
	return Object.values(store.sections)
		.filter(s => s.audit_cycle === auditCycleId)
		.sort((s1, s2) => s1.sequence - s2.sequence);
};
