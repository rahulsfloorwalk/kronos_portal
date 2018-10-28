
export default class ReportAttributeSelectors {
	constructor(namespace, auditCycleSelector){
		this.namespace = namespace;
		this.auditCycleSelector = auditCycleSelector;
	}

	getNamespacedStore = (store) => store[this.namespace];

	findReportAttributesByAuditCycleId = (store, auditCycleId) => {
		return this.getNamespacedStore(store).reportAttributes[auditCycleId] || [];
	};

	findSelectedOptionIdByAuditCycleIdAndJsonId = (store, auditCycleId, jsonId) => {
		const selectedOptionsByAuditCycle = this.getNamespacedStore(store).selectedOptionIds[auditCycleId];
		return selectedOptionsByAuditCycle ? selectedOptionsByAuditCycle[jsonId] : undefined;
	};

	findReportAttributesBySelectedAuditCycle = (store) => {
		const selectedAuditCycle = this.auditCycleSelector.findSelectedAuditCycleBySelectedQuestionnaireType(store);
		return selectedAuditCycle ? this.findReportAttributesByAuditCycleId(store, selectedAuditCycle.id) : [];
	};
}
