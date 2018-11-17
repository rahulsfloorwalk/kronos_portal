import types from "../action_types";

export default (state={}, action) => {
	switch(action.type){
		case types.REPORT_ATTRIBUTE_GET:
			return Object.assign({}, state, {
				[action.auditCycleId]: action.reportAttributes,
			});
			break;
		default:
			return state;
	}
	console.warn("WARNING: default case encountered for action: %O", action);
	return state;
}

export function fetchReportAttributesByAuditCycleId(auditCycleId, reportAttributes) {
	return {
		type: types.REPORT_ATTRIBUTE_GET,
		auditCycleId,
		reportAttributes
	};
}
