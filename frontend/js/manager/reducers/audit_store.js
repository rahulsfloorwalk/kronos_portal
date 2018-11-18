
import types from "../action_types";

export default (state={}, action) => {
	if(action.status !== "success") { return state; }
	switch(action.type){
	case types.AUDIT_STORE_GET:
		return ((auditStores) => {
			const obj = {};
			for( const a of auditStores){
				obj[a.id] = a;
			}
			return obj;
		})(action.auditStores);
	case types.AUDIT_STORE_ID_GET:
	case types.AUDIT_STORE_ID_UN_SUBMIT:
	case types.AUDIT_STORE_ID_SUBMIT:
	case types.AUDIT_STORE_ID_QA_OK:
	case types.AUDIT_STORE_ID_PM_REVERT:
	case types.AUDIT_STORE_ID_COMPLETE:
	case types.AUDIT_STORE_ID_UNCOMPLETE:
	case types.AUDIT_STORE_ID_FAIL:
	case types.AUDIT_STORE_ID_WITHDRAW:
	case types.AUDIT_STORE_ID_ACCEPT:
	case types.AUDIT_STORE_ID_REJECT:
	case types.AUDIT_STORE_ID_PAY:
	case types.AUDIT_STORE_ID_UNPAY:
	case types.AUDIT_STORE_UPDATED:
		return Object.assign({}, state, {
			[action.auditStore.id]: action.auditStore,
		});
	default:
		return state;
	}
};
