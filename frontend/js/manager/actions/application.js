import $ from 'jquery'
import { url } from '../../../config.js'
import types from '../action_types.js';

export function fetchApplications(auditId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_APPLICATION_GET,
			status: 'request',
			auditId,
		});

		$.get( url.api_base_path + `manager/audit/${auditId}/application`, function(applications){
			dispatch({
				type: types.AUDIT_APPLICATION_GET,
				status: 'success',
				auditId,
				applications
			});
		});
		//TODO: Handle error
	};
};

export function submitApplicationAssignForm(obj){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_APPLICATION_ASSIGN,
			status: 'request',
			applicationId: obj.application_id
		});

		var promise = $.ajax({
			url: url.api_base_path + `manager/application/${obj.application_id}/assign`, 
			method: 'POST',
			data: JSON.stringify({
				'audit_date': obj.audit_date
			}),
			contentType: 'application/json'
		});
		promise.done(function(application){
			dispatch({
				type: types.AUDIT_APPLICATION_ASSIGN,
				status: 'success',
				application: application
			});
		});
		promise.fail(function(error){
			dispatch({
				type: types.AUDIT_APPLICATION_ASSIGN,
				status: 'error',
				errors: error.responseJSON
			});
		});
		return promise;
		//TODO: Handle error
	};
};

export function submitApplicationRejectForm(application_id){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_APPLICATION_REJECT,
			status: 'request',
			applicationId: application_id
		});

		var promise = $.ajax({
			url: url.api_base_path + `manager/application/${application_id}/reject`,
			method: 'POST',
		});
		promise.done(function(application){
			dispatch({
				type: types.AUDIT_APPLICATION_REJECT,
				status: 'success',
				application: application
			});
		});
		promise.fail(function(error){
			dispatch({
				type: types.AUDIT_APPLICATION_REJECT,
				status: 'error',
				errors: error.responseJSON
			});
		});
		return promise;
		//TODO: Handle error
	};
};

export function submitApplicationCompleteForm(application_id){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_APPLICATION_COMPLETE,
			status: 'request',
			applicationId: application_id
		});

		var promise = $.ajax({
			url: url.api_base_path + `manager/application/${application_id}/complete`,
			method: 'POST',
		});
		promise.done(function(application){
			dispatch({
				type: types.AUDIT_APPLICATION_COMPLETE,
				status: 'success',
				application: application
			});
		});
		promise.fail(function(error){
			dispatch({
				type: types.AUDIT_APPLICATION_COMPLETE,
				status: 'error',
				errors: error.responseJSON
			});
		});
		return promise;
		//TODO: Handle error
	};
};


export function submitApplicationFailForm(application_id){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_APPLICATION_FAIL,
			status: 'request',
			applicationId: application_id
		});

		var promise = $.ajax({
			url: url.api_base_path + `manager/application/${application_id}/fail`,
			method: 'POST',
		});
		promise.done(function(application){
			dispatch({
				type: types.AUDIT_APPLICATION_FAIL,
				status: 'success',
				application: application
			});
		});
		promise.fail(function(error){
			dispatch({
				type: types.AUDIT_APPLICATION_FAIL,
				status: 'error',
				errors: error.responseJSON
			});
		});
		return promise;
		//TODO: Handle error
	};
};
