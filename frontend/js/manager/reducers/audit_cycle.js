
import types from "../action_types";

export default (state={}, action) => {
	if(action.status !== "success") { return state; }
	switch(action.type){
		case types.AUDIT_CYCLE_GET:
			return ((auditCycles) => {
				const obj = {};
				for( const a of auditCycles){
					obj[a.id] = a;
				}
				return obj;
			})(action.auditCycles);
			break;
		case types.AUDIT_CYCLE_POST:
			return Object.assign({}, state, {
				[action.auditCycle.id]: action.auditCycle
			});
			break;
		case types.AUDIT_CYCLE_ID_GET:
			return Object.assign({}, state, {
				[action.auditCycle.id]: action.auditCycle,
			});
			break;
		case types.AUDIT_CYCLE_ID_POST:
			return Object.assign({}, state, {
				[action.auditCycle.id]: action.auditCycle,
			});
			break;
		default:
			return state;
	}
};
