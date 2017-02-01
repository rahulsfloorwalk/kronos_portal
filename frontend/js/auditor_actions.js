import $ from 'jquery'
import { url } from '../config'
import { hashHistory } from 'react-router';
import types from './auditor/action_types.js'

/**
 * These are also action creators which employ redux-thunk so that we can return a function(dispatch) instead of a plain action.
 * This allows you to configure the returned function with parameters ala factories.
 */

export function fetchAudits(){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_GET,
			status: 'request',
		});

		return $.get( url.api_base_path + "auditor/audit", function(audits){
			dispatch({
				type: types.AUDIT_GET,
				status: 'success',
				audits: audits
			});
		});
		//TODO: Handle error
	};
};

export function fetchAudit(auditId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_ID_GET,
			status: 'request',
			auditId: auditId
		});

		return $.get( url.api_base_path + `auditor/audit/${auditId}`, function(audit){
			dispatch({
				type: types.AUDIT_ID_GET,
				status: 'success',
				audit: audit
			});
		});
		//TODO: Handle error
	};
};

export function loadAuditApplyForm( auditId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_APPLY_FORM_LOAD,
			status: 'request',
			auditId: auditId
		});

		var auditPromise = dispatch(fetchAudit(auditId));

		auditPromise.done(function(audit){
			dispatch({
				type: types.AUDIT_APPLY_FORM_LOAD,
				status: 'success',
				auditId: auditId
			});
		});
	};
};

export function submitAuditApplyForm( auditApplication){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_APPLY_FORM_SUB,
			status: 'request',
			auditApplication: auditApplication
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + `auditor/audit/${auditApplication.audit_id}/location/${auditApplication.location_id}/application/apply`,
			data: JSON.stringify(auditApplication),
			contentType: "application/json"
		});
		req.done(function(savedApplication){
			console.log("success",savedApplication);
			dispatch({
				type: types.AUDIT_APPLY_FORM_SUB,
				status: 'success',
				auditApplication: savedApplication
			});
			hashHistory.push(`/audit/${auditApplication.audit_id}`);
		});
		req.fail(function(error){
			dispatch({
				type: types.AUDIT_APPLY_FORM_SUB,
				status: 'error',
				errors: error.responseJSON
			});
		});

		return req;
	};
};

export function fetchApplicationsForAudit(auditId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_ID_GET_APPLICATIONS,
			status: 'request',
			auditId: auditId
		});

		$.get( url.api_base_path + `auditor/audit/${auditId}/applications`, function(applications){
			dispatch({
				type: types.AUDIT_ID_GET_APPLICATIONS,
				status: 'success',
				applications: applications,
			});
		});
		//TODO: Handle error
	};
};

export function loadAuditCancelForm( auditId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_CANCEL_FORM_LOAD,
			status: 'request',
			auditId: auditId,
		});

		var auditPromise = dispatch(fetchAudit(auditId));

		auditPromise.done(function(audit){
			dispatch({
				type: types.AUDIT_CANCEL_FORM_LOAD,
				status: 'success',
				auditId: auditId
			});
		});
	};
};

export function submitAuditCancelForm( auditId, locationId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_CANCEL_FORM_SUB,
			status: 'request',
			auditId: auditId,
			locationId: locationId
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + `auditor/audit/${auditId}/location/${locationId}/application/cancel`,
			contentType: "application/json"
		});
		req.done(function(savedApplication){
			console.log("success",savedApplication);
			dispatch({
				type: types.AUDIT_CANCEL_FORM_SUB,
				status: 'success',
				auditApplication: savedApplication
			});
			hashHistory.push(`/audit/${auditId}`);
		});
		req.fail(function(error){
			dispatch({
				type: types.AUDIT_CANCEL_FORM_SUB,
				status: 'error',
				errors: error.responseJSON || { }
			});
		});

		return req;
	};
};
