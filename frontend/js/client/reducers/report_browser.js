import {
	FETCH_REPORTS,
	SELECT_CITY,
	SELECT_STORE_TYPE,
	SELECT_PRIORITY,
	SELECT_START_DATE,
	SELECT_END_DATE,
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
			selectedPriority: action.selectedStorePriority,
		});
	case SELECT_START_DATE:
		return Object.assign({}, state, {
			selectedStartDate: action.selectedStartDate,
		});
	case SELECT_END_DATE:
		return Object.assign({}, state, {
			selectedEndDate: action.selectedEndDate,
		});
	default:
		return state;
	}
};

