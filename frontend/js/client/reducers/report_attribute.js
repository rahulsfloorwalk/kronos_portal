
import {
	FETCH_REPORT_ATTRIBUTES, SELECT_REPORT_ATTRIBUTE_OPTION,
} from "../action_types";

const initialState = {
	reportAttributes: {},
	selectedOptionIds: {},
};

export default (state=initialState, action) => {
	switch(action.type){
	case FETCH_REPORT_ATTRIBUTES:
		return Object.assign({}, state, {
			reportAttributes: Object.assign({}, state.reportAttributes, {
				[action.auditCycleId]: action.reportAttributes,
			}),
		});
	case SELECT_REPORT_ATTRIBUTE_OPTION:
		return Object.assign({}, state, {
			selectedOptionIds: Object.assign({}, state.selectedOptionIds, {
				[action.auditCycleId]: Object.assign({}, state.selectedOptionIds[action.auditCycleId], {
					[action.jsonId]: action.optionId,
				}),
			}),
		});
	default:
		return state;
	}
};

export function fetchReportAttributesByAuditCycleId(auditCycleId, reportAttributes){
	return {
		type: FETCH_REPORT_ATTRIBUTES,
		auditCycleId,
		reportAttributes,
	};
}

