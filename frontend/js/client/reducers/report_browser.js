import {
	FETCH_REPORTS,
	SELECT_CITY,
	SELECT_STATE,
	SELECT_COUNTRY,
	SELECT_STORE_TYPE,
	SELECT_PRIORITY,
	SELECT_START_DATE,
	SELECT_END_DATE,
	RESET_FILTERS,
	RESET_CITY_FILTER,
	RESET_STATE_FILTER,
	SELECT_REPORT_ATTRIBUTE_OPTION,
} from "../action_types";

const initialState = {
	reports: {},
	selectedCityId: null,
	selectedState: null,
	selectedCountry: null,
	selectedStoreType: null,
	selectedStorePriority: null,
	selectedEndDate: null,
	selectedStartDate: null,
	selectedOptionIds: {},
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
	case SELECT_STATE:
		return Object.assign({}, state, {
			selectedState: action.selectedState,
			selectedCityId: null,
		});
	case SELECT_COUNTRY:
		return Object.assign({}, state, {
			selectedCountry: action.selectedCountry,
			selectedState: null,
			selectedCityId: null
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
	case SELECT_REPORT_ATTRIBUTE_OPTION:
		return Object.assign({}, state, {
			selectedOptionIds: Object.assign({}, state.selectedOptionIds, {
				[action.jsonId]: action.optionId,
			}),
		});
	case RESET_CITY_FILTER:
		return Object.assign({}, state, {
			selectedCityId: null,
		});
	case RESET_STATE_FILTER:
		return Object.assign({}, state, {
			selectedState: null,
		});
	case RESET_FILTERS:
		return Object.assign({}, state, {
			selectedCityId: null,
			selectedState: null,
			selectedCountry: null,
			selectedStoreType: null,
			selectedStorePriority: null,
			selectedEndDate: null,
			selectedStartDate: null,
			selectedOptionIds: {},
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

export function resetCityFilter(){
	return {
		type: RESET_CITY_FILTER,
	};
}

export function resetStateFilter(){
	return {
		type: RESET_STATE_FILTER,
	};
}

export function selectCity(selectedCityId){
	return {
		type: SELECT_CITY,
		selectedCityId,
	};
}

export function selectState(selectedState){
	const obj = {
		type: SELECT_STATE,
		selectedState,
	};
	return obj;
}

export function selectCountry(selectedCountry){
	const obj = {
		type: SELECT_COUNTRY,
		selectedCountry,
	};
	return obj;
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

export function selectReportAttributeOption(jsonId, optionId){
	return {
		type: SELECT_REPORT_ATTRIBUTE_OPTION,
		jsonId,
		optionId,
	};
}

