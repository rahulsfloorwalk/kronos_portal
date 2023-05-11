
import types from "../action_types";

export default (state={}, action) => {
	if(action.status !== "success") { return state; }
	switch(action.type){
	case types.REMAINING_STORE_GET_BY_AUDIT_CYCLE_ID:
		return ((remainingStore) => {
			const obj = {};
			for( const s of remainingStore){
				obj[s.id] = s;
			}
			return obj;
		})(action.remainingStore);
	default:
		return state;
	}
};
