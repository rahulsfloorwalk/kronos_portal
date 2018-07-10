import { FETCH_AUDIT_STORE } from "../action_types.js";
import * as auditStore from "../service/audit_store.js";

export function fetchAuditStore(auditStoreId){
	return function(dispatch){
		return auditStore.fetchAuditStore(auditStoreId).then((auditStore) => {
			dispatch({
				type: FETCH_AUDIT_STORE,
				auditStore: auditStore,
			});
		});
	};
}

export function submitAuditStore(auditStoreId){
	return function(dispatch){
		return auditStore.submitAuditStore(auditStoreId).then((auditStore) => {
			dispatch({
				type: FETCH_AUDIT_STORE,
				auditStore: auditStore,
			});
		});
	};
}

export function acknowledgeAuditStore(auditStoreId){
	return function(dispatch){
		return auditStore.acknowledgeAuditStore(auditStoreId).then((auditStore) => {
			dispatch({
				type: FETCH_AUDIT_STORE,
				auditStore: auditStore,
			});
		});
	};
}
