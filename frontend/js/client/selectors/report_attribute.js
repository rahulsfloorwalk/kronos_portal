
export default class ReportAttributeSelectors {
	constructor(namespace){
		this.namespace = namespace;
	}

	getNamespacedStore = (store) => store[this.namespace];

	findReportAttributesByAuditCycleId = (store, auditCycleId) => {
		return this.getNamespacedStore(store).reportAttributes[auditCycleId] || [];
	};
}
