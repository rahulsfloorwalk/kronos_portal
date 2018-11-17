
import types from "../action_types";

export default (state={}, action) => {
	if(action.status !== "success") { return state; }
	switch(action.type){
		case types.AUDIT_GET:
			return ((audits) => {
				const obj = {};
				for( const a of audits){
					obj[a.id] = a;
				}
				return obj;
			})(action.audits);
			break;
		case types.AUDIT_ID_GET:
			return Object.assign({}, state, {
				[action.audit.id]: action.audit,
			});
			break;
		case types.AUDIT_POST:
			return Object.assign({}, state, {
				[action.audit.id]: action.audit,
			});
			break;
		case types.AUDIT_ID_POST:
			return Object.assign({}, state, {
				[action.audit.id]: action.audit,
			});
			break;
		case types.AUDIT_ID_DELETE:
			return ((audits, auditId) => {
				const obj = {};
				for( const id in audits){
					if(parseInt(id) !== parseInt(auditId)){
						obj[id] = audits[id];
					}
				}
				return obj;
			})(state, action.auditId);
			break;
		default:
			return state;
	}
};
