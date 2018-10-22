import {
	FETCH_REPORTS,
	SELECT_CITY,
	SELECT_STORE_TYPE,
	SELECT_PRIORITY,
	SELECT_START_DATE,
	SELECT_END_DATE,
	RESET_FILTERS,
} from "../action_types";

const initialState = {
	reports: {},
	selectedCityId: null,
	selectedStoreType: null,
	selectedStorePriority: null,
	selectedEndDate: null,
	selectedStartDate: null,
};

export default (state=initialState, action) => {
	switch(action.type){
	case FETCH_REPORTS:
		return Object.assign({}, state, {
			reports: Object.assign({}, state.reports, {
				[action.auditCycleId]: action.reports,
			}),
		});
	case SELECT_CITY:
		return Object.assign({}, state, {
			selectedCityId: action.selectedCityId,
		});
	case SELECT_STORE_TYPE:
		return Object.assign({}, state, {
			selectedStoreType: action.selectedStoreType,
		});
	case SELECT_PRIORITY:
		return Object.assign({}, state, {
			selectedStorePriority: action.selectedStorePriority,
		});
	case SELECT_START_DATE:
		return Object.assign({}, state, {
			selectedStartDate: action.selectedStartDate,
		});
	case SELECT_END_DATE:
		return Object.assign({}, state, {
			selectedEndDate: action.selectedEndDate,
		});
	case RESET_FILTERS:
		return Object.assign({}, state, {
			selectedCityId: null,
			selectedStoreType: null,
			selectedStorePriority: null,
			selectedEndDate: null,
			selectedStartDate: null,
		});
	default:
		return state;
	}
};

export function fetchReportsByAuditCycleId(auditCycleId, reports){
	return {
		type: FETCH_REPORTS,
		auditCycleId,
		reports,
	};
}

export function resetDependentFilters(){
	return {
		type: RESET_FILTERS,
	};
}

export function selectCity(selectedCityId){
	return {
		type: SELECT_CITY,
		selectedCityId,
	};
}

export function selectStoreType(selectedStoreType){
	return {
		type: SELECT_STORE_TYPE,
		selectedStoreType,
	};
}

export function selectPriority(selectedStorePriority){
	return {
		type: SELECT_PRIORITY,
		selectedStorePriority,
	};
}

export function selectStartDate(selectedStartDate){
	return {
		type: SELECT_START_DATE,
		selectedStartDate,
	};
}

export function selectEndDate(selectedEndDate){
	return {
		type: SELECT_END_DATE,
		selectedEndDate,
	};
}
