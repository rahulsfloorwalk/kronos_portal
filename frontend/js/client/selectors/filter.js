
export default class FilterSelectors {
	constructor(namespace, reportBrowserSelectors, reportAttributeSelectors, auditCycleSelectors){
		this.namespace = namespace;
		this.reportAttributeSelectors = reportAttributeSelectors;
		this.reportBrowserSelectors = reportBrowserSelectors;
		this.auditCycleSelectors = auditCycleSelectors;
	}

	filterReports = (store) => {
		const selectedAuditCycle = this.auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType(store);

		if(!selectedAuditCycle){
			return [];
		}

		const filterState = this.reportAttributeSelectors.findReportAttributesBySelectedAuditCycle(store)
			.map((ra) => [
				ra.json_id,
				this.reportAttributeSelectors.findSelectedOptionIdByAuditCycleIdAndJsonId(
					store, 
					selectedAuditCycle.id, 
					ra.json_id
				)
			]).filter(([jsonId, selectedOptionId]) => !!selectedOptionId);

		return this.reportBrowserSelectors.filterReports(store).filter((r) => {
			return filterState.reduce((filteredIn, [jsonId, optionId]) => filteredIn && r.attribute_data[jsonId] === optionId, true);
		});
	};
}
