
import types from "../action_types";

export default (state={}, action) => {
	if(action.status !== "success") { return state; }
	switch(action.type){
	case types.AUDIT_APPLICATION_GET:
		return ((applications) => {
			const obj = {};
			for( const a of applications){
				obj[a.id] = a;
			}
			return obj;
		})(action.applications);
	case types.AUDIT_APPLICATION_APPROVE:
	case types.AUDIT_APPLICATION_REJECT:
	default:
		return state;
	}
};
