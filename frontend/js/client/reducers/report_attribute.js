
import {
	FETCH_REPORT_ATTRIBUTES,
} from "../action_types";

const initialState = {
	reportAttributes: {},
};

export default (state=initialState, action) => {
	switch(action.type){
	case FETCH_REPORT_ATTRIBUTES:
		return Object.assign({}, state, {
			reportAttributes: Object.assign({}, state.reportAttributes, {
				[action.auditCycleId]: action.reportAttributes,
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

