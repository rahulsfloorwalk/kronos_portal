
import types from "../action_types";

export default (state={}, action) => {
	switch(action.type){
	case types.AUDIT_CYCLE_MODERATOR_SUMMARY:
		return Object.assign({}, state, {
			[action.auditCycleId]: action.moderatorSummary,
		});
	default:
		return state;
	}
};
