
export const findSectionsByAuditCycleId = (store, auditCycleId) => {
	return Object.values(store.sections)
		.filter(s => s.audit_cycle === auditCycleId)
		.sort((s1, s2) => s1.sequence - s2.sequence);
};

export const findQuestionnaireTotalForAuditCycleId = (store, auditCycleId) => {
	return Object.values(store.sections)
		.filter(s => s.audit_cycle === auditCycleId)
		.reduce((sum, section) => sum + section.max_marks, 0);
};

export const findSectionBySectionId = (store, sectionId) => {
	return store.sections[sectionId];
};
