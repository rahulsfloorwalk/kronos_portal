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

export function loadAuditStoreAddForm(){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_STORE_FORM_LOAD,
			status: 'success'
		});
	};
};

export function loadAuditStoreEditForm(auditStoreId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_STORE_FORM_LOAD,
			status: 'request',
			auditStoreId: auditStoreId
		});
		return dispatch(fetchAuditStore(auditStoreId));
	};
};

export function saveAuditStoreAddForm(auditStore){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_STORE_FORM_SUB,
			status: 'request',
			auditStore: auditStore

		});
		dispatch({
			type: types.AUDIT_STORE_POST,
			status: 'request',
			auditStore: auditStore
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + `manager/audit_store`,
			data: JSON.stringify(store),
			contentType: "application/json"
		});
		req.done(function(savedAuditStore){
			dispatch({
				type: types.AUDIT_STORE_POST,
				status: 'success',
				store: savedAuditStore
			});
			dispatch({
				type: types.AUDIT_STORE_FORM_SUB,
				status: 'success',
			});
		});
		req.fail(function(error){
			dispatch({
				type: types.AUDIT_STORE_POST,
				status: 'error',
				errors: error.responseJSON
			});
			dispatch({
				type: types.AUDIt_STORE_FORM_SUB,
				status: 'error',
			});
		});
		return req;
	};
};

export function saveAuditStoreEditForm(auditStore){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_STORE_FORM_SUB,
			status: 'request'
		});
		dispatch({
			type: types.AUDIT_STORE_ID_POST,
			status: 'request',
			auditStore: auditStore
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + `manager/audit_store/${audit_store.id}`,
			data: JSON.stringify(store),
			contentType: "application/json"
		});
		req.done(function(savedAuditStore){
			dispatch({
				type: types.AUDIT_STORE_ID_POST,
				status: 'success',
				auditStore: savedAuditStore
			});
			dispatch({
				type: types.AUDIT_STORE_FORM_SUB,
				status: 'success'
			});
		});
		req.fail(function(error){
			dispatch({
				type: types.AUDIT_STORE_ID_POST,
				status: 'error',
				errors: error.responseJSON
			});
			dispatch({
				type: types.AUDIT_STORE_FORM_SUB,
				status: 'error',
			});
		});
		return req;
	};
};
