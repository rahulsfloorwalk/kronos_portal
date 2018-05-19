import $ from 'jquery'
import { url } from '../../../config.js'
import types from '../action_types.js';
import { findAuditStoresByAuditCycle } from '../service/audit_store.js';

export function fetchAuditStores(auditCycleId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_STORE_GET,
			status: 'request',
			auditCycleId
		});

		return findAuditStoresByAuditCycle(auditCycleId).then(function(auditStores){
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

		let promise = $.ajax({
			url: url.api_base_path + `manager/audit_store/${auditStoreId}/complete`,
			method: 'POST',
			contentType: 'application/json'
		});
		promise.then(function(auditStore){
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

		return promise;
		//TODO: Handle error
	};
};

export function uncompleteAuditStore(auditStoreId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_STORE_ID_UNCOMPLETE,
			status: 'request',
			auditStoreId
		});

		return $.post( url.api_base_path + `manager/audit_store/${auditStoreId}/uncomplete`).then(function(auditStore){
			dispatch({
				type: types.AUDIT_STORE_ID_UNCOMPLETE,
				status: 'success',
				auditStore
			});
		}, function(err){
			dispatch({
				type: types.AUDIT_STORE_ID_UNCOMPLETE,
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

export function acceptAuditStore(auditStoreId, payment_amount){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_STORE_ID_ACCEPT,
			status: 'request',
			auditStoreId
		});

		let promise = $.ajax({
			url: url.api_base_path + `manager/audit_store/${auditStoreId}/accept`,
			method: 'POST',
			data: JSON.stringify({
				'payment_amount': payment_amount,
			}),
			contentType: 'application/json',
		});
		promise.done(function(auditStore){
			dispatch({
				type: types.AUDIT_STORE_ID_ACCEPT,
				status: 'success',
				auditStore
			});
		});
		//TODO: Handle error
		return promise;
	};
};

export function rejectAuditStore(auditStoreId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_STORE_ID_REJECT,
			status: 'request',
			auditStoreId
		});

		return $.post( url.api_base_path + `manager/audit_store/${auditStoreId}/reject`, function(auditStore){
			dispatch({
				type: types.AUDIT_STORE_ID_REJECT,
				status: 'success',
				auditStore
			});
		});
		//TODO: Handle error
	};
};



export function updateAuditStore(auditStore){
	return {
		type: types.AUDIT_STORE_UPDATED,
		status: 'success',
		auditStore
	};
};
