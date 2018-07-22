import { FETCH_AUDIT_STORE } from "../action_types.js";

export default (auditStores=[], action) => {
	switch(action.type){
	case FETCH_AUDIT_STORE: {
		const idx = auditStores.findIndex((as) => as.id === action.auditStore.id);
		if(idx < 0){
			return [...auditStores, action.auditStore];
		} else {
			return Object.assign([], auditStores, { [idx]: action.auditStore });
		}
	}
	default:
		return auditStores;
	}
};

export const findAuditStore = (store, auditStoreId) => {
	return store.auditStores.find((as) => as.id === auditStoreId);
};
