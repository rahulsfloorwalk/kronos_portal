
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
				this.reportBrowserSelectors.findSelectedOptionIdByJsonId(
					store,
					ra.json_id
				)
			]).filter((tuple) => tuple[1] !== undefined);

		return this.reportBrowserSelectors.filterReports(store).filter((r) => {
			return filterState.reduce((filteredIn, [jsonId, optionId]) => filteredIn && r.attribute_data[jsonId] === optionId, true);
		});
	};

	getFilterState = (store) => {
		let filterState = {};
		this.reportAttributeSelectors.findReportAttributesBySelectedAuditCycle(store).map((ra) => {
			let selected_option_id = this.reportBrowserSelectors.findSelectedOptionIdByJsonId(store, ra.json_id);
			if(selected_option_id){
				filterState[ra.json_id] = selected_option_id;
			}
		});
		return filterState;
	};
}
