import moment from "moment";

export default class ReportBrowserSelectors {
	constructor(namespace, auditCycleSelectors){
		this.namespace = namespace;
		this.auditCycleSelectors = auditCycleSelectors;
	}

	getNamespacedStore = (store) => store[this.namespace];

	findReportsByAuditCycleId = (store, auditCycleId) => {
		return this.getNamespacedStore(store).reports[auditCycleId] || [];
	};

	findSelectedCityId = (store) => {
		return this.getNamespacedStore(store).selectedCityId;
	};

	findCitiesByAuditCycleId = (store, auditCycleId) => {
		return this.findReportsByAuditCycleId(store, auditCycleId)
			.reduce((cities, report) => {
				const city = cities.find((c) => c.id === report.city_id);
				if(!city){
					return cities.concat({
						id: report.city_id,
						name: report.city_name,
					});
				} else {
					return cities;
				}
			}, []);
	};

	findStoreTypesByAuditCycleId = (store, auditCycleId) => {
		return this.findReportsByAuditCycleId(store, auditCycleId)
			.reduce((storeTypes, report) => {
				const storeType = storeTypes.find((t) => t === report.store_type);
				if(!storeType){
					return storeTypes.concat(report.store_type);
				} else {
					return storeTypes;
				}
			}, []);
	};

	findStorePrioritiesByAuditCycleId = (store, auditCycleId) => {
		return this.findReportsByAuditCycleId(store, auditCycleId)
			.reduce((storePriorities, report) => {
				const storePriority = storePriorities.find((p) => p === report.store_priority);
				if(!storePriority){
					return storePriorities.concat(report.store_priority);
				} else {
					return storePriorities;
				}
			}, []);
	};

	findSelectedStoreType = (store) => {
		return this.getNamespacedStore(store).selectedStoreType;
	};

	findSelectedStorePriority = (store) => {
		return this.getNamespacedStore(store).selectedStorePriority;
	};

	findSelectedStartDate = (store) => {
		return this.getNamespacedStore(store).selectedStartDate;
	};

	findSelectedEndDate = (store) => {
		return this.getNamespacedStore(store).selectedEndDate;
	};

	findCitiesBySelectedAuditCycle = (state) => {
		const selectedAuditCycle = this.auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType(state);
		if(selectedAuditCycle){
			return this.findCitiesByAuditCycleId(state, selectedAuditCycle.id);
		} else {
			return [];
		}
	};

	findStoreTypesBySelectedAuditCycle = (state) => {
		const selectedAuditCycle = this.auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType(state);
		if(selectedAuditCycle){
			return this.findStoreTypesByAuditCycleId(state, selectedAuditCycle.id);
		} else {
			return [];
		}
	};

	findStorePrioritiesBySelectedAuditCycle = (state) => {
		const selectedAuditCycle = this.auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType(state);
		if(selectedAuditCycle){
			return this.findStorePrioritiesByAuditCycleId(state, selectedAuditCycle.id);
		} else {
			return [];
		}
	};

	findSelectedStartDateBySelectedAuditCycle = (store) => {
		return this.findSelectedStartDate(store) || this.findStartDateBySelectedAuditCycle(store);
	};

	findSelectedEndDateBySelectedAuditCycle = (store) => {
		return this.findSelectedEndDate(store) || this.findEndDateBySelectedAuditCycle(store);
	};

	findMinimumStartDateBySelectedAuditCycle = (store) => {
		return this.findStartDateBySelectedAuditCycle(store);
	};

	findMaximumStartDateBySelectedAuditCycle = (store) => {
		return this.findSelectedEndDateBySelectedAuditCycle(store);
	};

	findMinimumEndDateBySelectedAuditCycle = (store) => {
		return this.findSelectedStartDateBySelectedAuditCycle(store);
	};

	findMaximumEndDateBySelectedAuditCycle = (store) => {
		return this.findEndDateBySelectedAuditCycle(store);
	};


	findStartDateBySelectedAuditCycle = (state) => {
		const selectedAuditCycle = this.auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType(state);
		if(selectedAuditCycle){
			return selectedAuditCycle.start_date;
		} else {
			return null;
		}
	};

	findEndDateBySelectedAuditCycle = (state) => {
		const selectedAuditCycle = this.auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType(state);
		if(selectedAuditCycle){
			return selectedAuditCycle.end_date;
		} else {
			return null;
		}
	};

	filterReports = (store) => {
		const selectedAuditCycle = this.auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType(store);

		const selectedCityId = this.findSelectedCityId(store);
		const selectedStoreType = this.findSelectedStoreType(store);
		const selectedStorePriority = this.findSelectedStorePriority(store);
		const selectedStartDate = this.findSelectedStartDateBySelectedAuditCycle(store);
		const selectedEndDate = this.findSelectedEndDateBySelectedAuditCycle(store);

		if(selectedAuditCycle) {
			return this.findReportsByAuditCycleId(store, selectedAuditCycle.id)
				.filter(r => selectedCityId ? r.city_id === selectedCityId : true)
				.filter(r => selectedStoreType ? r.store_type === selectedStoreType : true)
				.filter(r => selectedStorePriority ? r.store_priority === selectedStorePriority : true)
				.filter(r => moment(r.audit_date).isBetween(selectedStartDate, selectedEndDate, null, "[]"));
		} else {
			return [];
		}
	};
}
