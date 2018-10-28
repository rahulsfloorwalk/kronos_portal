
export default class ReportAttributeSelectors {
	constructor(namespace){
		this.namespace = namespace;
	}

	getNamespacedStore = (store) => store[this.namespace];

	findReportAttributesByAuditCycleId = (store, auditCycleId) => {
		return this.getNamespacedStore(store).reportAttributes[auditCycleId] || [];
	};

	findSelectedOptionIdByAuditCycleIdAndJsonId = (store, auditCycleId, jsonId) =>  {
		const selectedOptionsByAuditCycle = this.getNamespacedStore(store).selectedOptionIds[auditCycleId];
		return selectedOptionsByAuditCycle ? selectedOptionsByAuditCycle[jsonId] : undefined;
	};
}
