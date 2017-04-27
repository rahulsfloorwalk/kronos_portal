import $ from 'jquery'
import { url } from '../../../config.js'
import types from '../action_types.js';

export function fetchAuditStores(auditCycleId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_STORE_GET,
			status: 'request',
			auditCycleId
		});

		return $.get( url.api_base_path + `manager/audit_cycle/${auditCycleId}/audit_store`, function(auditStores){
			dispatch({
				type: types.AUDIT_STORE_GET,
				status: 'success',
				auditStores
			});
		});
		//TODO: Handle error
	};
};

export function fetchAuditStore(auditStoreId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_STORE_ID_GET,
			status: 'request',
			auditStoreId: auditStoreId
		});

		return $.get( url.api_base_path + `manager/audit_store/${auditStoreId}`, function(auditStore){
			dispatch({
				type: types.AUDIT_STORE_ID_GET,
				status: 'success',
				auditStore: auditStore
			});
		});
		//TODO: Handle error
	};
};

export function withdrawAuditStore(auditStoreId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_STORE_ID_WITHDRAW,
			status: 'request',
			auditStoreId
		});

		return $.post( url.api_base_path + `manager/audit_store/${auditStoreId}/withdraw`, function(auditStore){
			dispatch({
				type: types.AUDIT_STORE_ID_WITHDRAW,
				status: 'success',
				auditStore
			});
		});
		//TODO: Handle error
	};
};

export function completeAuditStore(auditStoreId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_STORE_ID_COMPLETE,
			status: 'request',
			auditStoreId
		});

		return $.post( url.api_base_path + `manager/audit_store/${auditStoreId}/complete`).then(function(auditStore){
			dispatch({
				type: types.AUDIT_STORE_ID_COMPLETE,
				status: 'success',
				auditStore
			});
		}, function(err){
			dispatch({
				type: types.AUDIT_STORE_ID_COMPLETE,
				status: 'error',
				errors: err.responseJSON || {}
			});
		});
		//TODO: Handle error
	};
};

export function failAuditStore(auditStoreId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_STORE_ID_FAIL,
			status: 'request',
			auditStoreId
		});

		return $.post( url.api_base_path + `manager/audit_store/${auditStoreId}/fail`, function(auditStore){
			dispatch({
				type: types.AUDIT_STORE_ID_FAIL,
				status: 'success',
				auditStore
			});
		});
		//TODO: Handle error
	};
};

export function submitAuditStore(auditStoreId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_STORE_ID_SUBMIT,
			status: 'request',
			auditStoreId
		});

		return $.post( url.api_base_path + `manager/audit_store/${auditStoreId}/submit`, function(auditStore){
			dispatch({
				type: types.AUDIT_STORE_ID_SUBMIT,
				status: 'success',
				auditStore
			});
		});
		//TODO: Handle error
	};
};

export function unSubmitAuditStore(auditStoreId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_STORE_ID_UN_SUBMIT,
			status: 'request',
			auditStoreId
		});

		return $.post( url.api_base_path + `manager/audit_store/${auditStoreId}/unsubmit`, function(auditStore){
			dispatch({
				type: types.AUDIT_STORE_ID_UN_SUBMIT,
				status: 'success',
				auditStore
			});
		});
		//TODO: Handle error
	};
};

export function updateAuditStore(auditStore){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_STORE_UPDATED,
			status: 'success',
			auditStore
		});
	};
};
