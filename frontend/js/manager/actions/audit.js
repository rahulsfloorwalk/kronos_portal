import $ from 'jquery'
import { url } from '../config'
import types from './manager/action_types.js';

export function fetchAudits(){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_GET,
			status: 'request',
		});

		$.get( url.api_base_path + "manager/audit", function(audits){
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
		});

		$.get( url.api_base_path + `manager/audit/${auditId}`, function(audit){
			dispatch({
				type: types.AUDIT_ID_GET,
				status: 'success',
				audit: audit
			});
		});
		//TODO: Handle error
	};
};

export function loadAuditAddForm(){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_FORM_LOAD,
			status: 'success'
		});
	};
};

export function loadAuditEditForm(auditId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_FORM_LOAD,
			status: 'request',
			auditId: auditId
		});
		dispatch(fetchAudit(auditId));
	};
};

export function saveAuditAddForm(audit){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_FORM_SUB,
			status: 'request',
			audit: audit

		});
		dispatch({
			type: types.AUDIT_POST,
			status: 'request',
			audit: audit
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + "manager/audit",
			data: JSON.stringify(audit),
			contentType: "application/json"
		});
		req.done(function(savedAudit){
			dispatch({
				type: types.AUDIT_POST,
				status: 'success',
				audit: savedAudit
			});
			dispatch({
				type: types.AUDIT_FORM_SUB,
				status: 'success',
			});
			hashHistory.push(`/audit/${savedAudit.id}`);
		});
		req.fail(function(error){
			dispatch({
				type: types.AUDIT_POST,
				status: 'error',
				errors: error.responseJSON
			});
			dispatch({
				type: types.AUDIT_FORM_SUB,
				status: 'error',
			});
		});
	};
};

export function saveAuditEditForm(audit){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_FORM_SUB,
			status: 'request'
		});
		dispatch({
			type: types.AUDIT_ID_POST,
			status: 'request',
			audit: audit
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + `manager/audit/${audit.id}`,
			data: JSON.stringify(audit),
			contentType: "application/json"
		});
		req.done(function(savedAudit){
			dispatch({
				type: types.AUDIT_ID_POST,
				status: 'success',
				audit: savedAudit
			});
			dispatch({
				type: types.AUDIT_FORM_SUB,
				status: 'success'
			});
			hashHistory.push(`/audit/${savedAudit.id}`);
		});
		req.fail(function(error){
			dispatch({
				type: types.AUDIT_ID_POST,
				status: 'error',
				errors: error.responseJSON
			});
			dispatch({
				type: types.AUDIT_FORM_SUB,
				status: 'error',
			});
		});
	};
};

export function loadAuditLocationAddForm(){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_LOCATION_FORM_LOAD,
			status: 'request'
		});
		dispatch(fetchCities());
		dispatch(fetchLocations());
		dispatch({
			type: types.AUDIT_LOCATION_FORM_LOAD,
			status: 'success'
		});
	};
};

export function loadAuditLocationEditForm(auditLocationId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_LOCATION_FORM_LOAD,
			status: 'request',
			auditLocationId: auditLocationId
		});
		dispatch(fetchCities());
		dispatch(fetchLocations());
		dispatch({
			type: types.AUDIT_LOCATION_FORM_LOAD,
			status: 'success',
			auditLocationId: auditLocationId
		});
	};
};

export function saveAuditLocationAddForm(auditLocation){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_LOCATION_FORM_SUB,
			status: 'request',
			auditLocation: auditLocation

		});
		dispatch({
			type: types.AUDIT_LOCATION_POST,
			status: 'request',
			auditLocation: auditLocation
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + `manager/audit/${auditLocation.audit}/auditlocation`,
			data: JSON.stringify(auditLocation),
			contentType: "application/json"
		});
		req.done(function(savedAuditLocation){
			dispatch({
				type: types.AUDIT_LOCATION_POST,
				status: 'success',
				auditLocation: savedAuditLocation
			});
			dispatch({
				type: types.AUDIT_LOCATION_FORM_SUB,
				status: 'success',
				auditLocation: auditLocation
			});
			hashHistory.push(`/audit/${savedAuditLocation.audit}`);
		});
		req.fail(function(error){
			dispatch({
				type: types.AUDIT_LOCATION_POST,
				status: 'error',
				errors: error.responseJSON
			});
			dispatch({
				type: types.AUDIT_LOCATION_FORM_SUB,
				status: 'error',
			});
		});
	};
};

export function saveAuditLocationEditForm(auditLocation){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_LOCATION_FORM_SUB,
			status: 'request',
			auditLocation: auditLocation

		});
		dispatch({
			type: types.AUDIT_LOCATION_ID_POST,
			status: 'request',
			auditLocation: auditLocation
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + `manager/audit/${auditLocation.audit}/auditlocation/${auditLocation.id}`,
			data: JSON.stringify(auditLocation),
			contentType: "application/json"
		});
		req.done(function(savedAuditLocation){
			dispatch({
				type: types.AUDIT_LOCATION_ID_POST,
				status: 'success',
				auditLocation: savedAuditLocation
			});
			dispatch({
				type: types.AUDIT_LOCATION_FORM_SUB,
				status: 'success',
				auditLocation: auditLocation
			});
			hashHistory.push(`/audit/${savedAuditLocation.audit}`);
		});
		req.fail(function(error){
			dispatch({
				type: types.AUDIT_LOCATION_ID_POST,
				status: 'error',
				errors: error.responseJSON
			});
			dispatch({
				type: types.AUDIT_LOCATION_FORM_SUB,
				status: 'error',
			});
		});
	};
};
