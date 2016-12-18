import $ from 'jquery'
import { url } from '../config'
import { hashHistory } from 'react-router';
import types from './manager/action_types.js';

export function fetchLocations(){
	return function(dispatch){
		dispatch({
			type: types.LOCATION_GET,
			status: 'request',
		});

		$.get( url.api_base_path + "manager/location", function(locations){
			dispatch({
				type: types.LOCATION_GET,
				status: 'success',
				locations: locations
			});
		});
		//TODO: Handle error
	};
};

export function fetchLocation(locationId){
	return function(dispatch){
		dispatch({
			type: types.LOCATION_ID_GET,
			status: 'request',
			locationId: locationId
		});

		$.get( url.api_base_path + `manager/location/${locationId}`, function(location){
			dispatch({
				type: types.LOCATION_ID_GET,
				status: 'success',
				location: location
			});
		});
		//TODO: Handle error
	};
};


export function loadLocationAddForm(){
	return function(dispatch){
		dispatch({
			type: types.LOCATION_FORM_LOAD,
			status: 'success'
		});
	};
};

export function loadLocationEditForm(locationId){
	return function(dispatch){
		dispatch({
			type: types.LOCATION_FORM_LOAD,
			status: 'request',
			locationId: locationId
		});
		dispatch(fetchLocation(locationId));
	};
};

export function saveLocationEditForm(location){
	return function(dispatch){
		dispatch({
			type: types.LOCATION_FORM_SUB,
			status: 'request'
		});
		dispatch({
			type: types.LOCATION_ID_POST,
			status: 'request',
			location: location
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + `manager/location/${location.id}`,
			data: JSON.stringify(location),
			contentType: "application/json"
		});
		req.done(function(savedLocation){
			dispatch({
				type: types.LOCATION_ID_POST,
				status: 'success',
				location: savedLocation
			});
			dispatch({
				type: types.LOCATION_FORM_SUB,
				status: 'success'
			});
			hashHistory.push("/location");
		});
		req.fail(function(error){
			dispatch({
				type: types.LOCATION_ID_POST,
				status: 'error',
				errors: error.responseJSON
			});
			dispatch({
				type: types.LOCATION_FORM_SUB,
				status: 'error',
			});
		});
	};
};

export function saveLocationAddForm(location){
	return function(dispatch){
		dispatch({
			type: types.LOCATION_FORM_SUB,
			status: 'request',
			location: location

		});
		dispatch({
			type: types.LOCATION_POST,
			status: 'request',
			location: location
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + "manager/location",
			data: JSON.stringify(location),
			contentType: "application/json"
		});
		req.done(function(savedLocation){
			dispatch({
				type: types.LOCATION_POST,
				status: 'success',
				location: savedLocation
			});
			dispatch({
				type: types.LOCATION_FORM_SUB,
				status: 'success',
			});
			hashHistory.push("/location");
		});
		req.fail(function(error){
			dispatch({
				type: types.LOCATION_POST,
				status: 'error',
				errors: error.responseJSON
			});
			dispatch({
				type: types.LOCATION_FORM_SUB,
				status: 'error',
			});
		});
	};
};

export function fetchStates(){
	return function(dispatch){
		dispatch({
			type: types.STATE_GET,
			status: 'request',
		});

		return $.get( url.api_base_path + "manager/state", function(states){
			dispatch({
				type: types.STATE_GET,
				status: 'success',
				states: states
			});
		});
		//TODO: Handle error
	};
};

export function fetchCities(stateCode){
	return function(dispatch){
		dispatch({
			type: types.CITY_GET,
			status: 'request',
			stateCode
		});

		return $.get( url.api_base_path + `manager/city/${stateCode}`, function(cities){
			dispatch({
				type: types.CITY_GET,
				status: 'success',
				stateCode,
				cities: cities
			});
		});
		//TODO: Handle error
	};
};

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
