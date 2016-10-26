import $ from 'jquery'
import { url } from '../config'
import { hashHistory } from 'react-router';


export var types = {
	//Client GET Action Types
	CLIENT_GET_REQ: 'CLIENT_GET_REQ',
	CLIENT_GET_ERR: 'CLIENT_GET_ERR',
	CLIENT_GET_SUC: 'CLIENT_GET_SUC',

	//Client POST Action Types
	CLIENT_POST_REQ: 'CLIENT_POST_REQ',
	CLIENT_POST_ERR: 'CLIENT_POST_ERR',
	CLIENT_POST_SUC: 'CLIENT_POST_SUC',

	//Client ID GET Action Types
	CLIENT_ID_GET_REQ: 'CLIENT_ID_GET_REQ',
	CLIENT_ID_GET_ERR: 'CLIENT_ID_GET_ERR',
	CLIENT_ID_GET_SUC: 'CLIENT_ID_GET_SUC',

	//Client ID POST Action Types
	CLIENT_ID_POST_REQ: 'CLIENT_ID_POST_REQ',
	CLIENT_ID_POST_ERR: 'CLIENT_ID_POST_ERR',
	CLIENT_ID_POST_SUC: 'CLIENT_ID_POST_SUC',

	//Client Form Load Action Types
	CLIENT_FORM_LOAD_REQ: 'CLIENT_FORM_LOAD_REQ',
	CLIENT_FORM_LOAD_ERR: 'CLIENT_FORM_LOAD_ERR',
	CLIENT_FORM_LOAD_SUC: 'CLIENT_FORM_LOAD_SUC',

	//Client Form Submit Action Types
	CLIENT_FORM_SUB_REQ: 'CLIENT_FORM_SUB_REQ',
	CLIENT_FORM_SUB_ERR: 'CLIENT_FORM_SUB_ERR',
	CLIENT_FORM_SUB_SUC: 'CLIENT_FORM_SUB_SUC',

	//Auditor GET
	AUDITOR_GET_REQ: 'AUDITOR_GET_REQ',
	AUDITOR_GET_ERR: 'AUDITOR_GET_ERR',
	AUDITOR_GET_SUC: 'AUDITOR_GET_SUC',

	AUDITOR_ID_GET: 'AUDITOR_ID_GET',

	//Auditor sub information
	AUDITOR_GET_PROFILE_INFO: 'AUDITOR_GET_PROFILE_INFO',
	AUDITOR_GET_BANK_INFO: 'AUDITOR_GET_BANK_INFO',
	AUDITOR_GET_ADDITIONAL_INFO: 'AUDITOR_GET_ADDITIONAL_INFO',

	//Location get
	LOCATION_GET: 'LOCATION_GET',
	LOCATION_POST: 'LOCATION_POST',

	//Location Id get
	LOCATION_ID_GET: 'LOCATION_ID_GET',

	//Location Id post
	LOCATION_ID_POST: 'LOCATION_ID_POST',

	//Location Form
	LOCATION_FORM_LOAD: 'LOCATION_FORM_LOAD',
	LOCATION_FORM_SUB: 'LOCATION_FORM_SUB',

	//City get
	CITY_GET: 'CITY_GET',

	//Audit
	AUDIT_GET: 'AUDIT_GET',
	AUDIT_POST: 'AUDIT_POST',

	//Audit Id
	AUDIT_ID_GET: 'AUDIT_ID_GET',
	AUDIT_ID_POST: 'AUDIT_ID_POST',

	//Audit Form
	AUDIT_FORM_LOAD: 'AUDIT_FORM_LOAD',
	AUDIT_FORM_SUB: 'AUDIT_FORM_SUB',

	// Audit Location Form
	AUDIT_LOCATION_FORM_LOAD: 'AUDIT_LOCATION_FORM_LOAD',
	AUDIT_LOCATION_FORM_SUB: 'AUDIT_LOCATION_FORM_SUB',

	//Audit Location
	AUDIT_LOCATION_POST: 'AUDIT_LOCATION_POST',
	AUDIT_LOCATION_ID_POST: 'AUDIT_LOCATION_ID_POST',
};

/**
 * These are the action creators as mentioned here: http://redux.js.org/docs/basics/ExampleTodoList.html#action-creators
 * Call them with arguments (if any) to create action objects that you can pass to dispatch(...)
 */

function clientGetReq(){
	return {
		type: types.CLIENT_GET_REQ
	};
}
function clientGetSuccess(clients){
	return {
		type: types.CLIENT_GET_SUC,
		clients: clients
	};
}
function clientGetError(errors){
	return {
		type: types.CLIENT_GET_SUC,
		errors: errors
	};
}

function clientIdGetRequest(id){
	return {
		type: types.CLIENT_ID_GET_REQ,
		id: id
	};
}
function clientIdGetSuccess(client){
	return {
		type: types.CLIENT_ID_GET_SUC,
		client: client
	};
}
function clientIdGetError(){
	return {
		type: types.CLIENT_ID_GET_ERR,
		errors: errors
	};
}

/**
 * These are also action creators which employ redux-thunk so that we can return a function(dispatch) instead of a plain action.
 * This allows you to configure the returned function with parameters ala factories.
 */
export function fetchProfileInfo(){
	return function(dispatch){
		dispatch(profileInfoGetReq());

		$.get( url.api_base_path + "auditor/profile-api?format=json", function(profileInfo){
			dispatch(profileInfoGetSuccess(profileInfo));
		});
		//TODO: Handle error
	};
};

export function saveProfileInfo(profileInfo){
	return function(dispatch){
		dispatch(profileInfoPostReq(profileInfo));

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + "auditor/profile-api",
			data: JSON.stringify(profileInfo),
			contentType: "application/json"
		});
		req.done(function(profileInfo){
			console.log("success",profileInfo);
			dispatch(profileInfoPostSuccess(profileInfo));
			hashHistory.push("/details");
		});
		req.fail(function(error){
			dispatch(profileInfoPostError(error.responseJSON));
		});
	};
};

export function fetchBankInfo(){
	return function(dispatch){
		dispatch(bankInfoGetReq());

		$.get( url.api_base_path + "auditor/bank-api?format=json", function(bankInfo){
			dispatch(bankInfoGetSuccess(bankInfo));
		});
		//TODO: Handle error
	};
};

export function saveBankInfo(bankInfo){
	return function(dispatch){
		dispatch(bankInfoPostReq(bankInfo));

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + "auditor/bank-api",
			data: JSON.stringify(bankInfo),
			contentType: "application/json"
		});
		req.done(function(bankInfo){
			console.log("success",bankInfo);
			dispatch(bankInfoPostSuccess(bankInfo));
			hashHistory.push("/details");
		});
		req.fail(function(error){
			dispatch(bankInfoPostError(error.responseJSON));
		});
	};
};

export function fetchAdditionalInfo(){
	return function(dispatch){
		dispatch(additionalInfoGetReq());

		$.get( url.api_base_path + "auditor/additional-api?format=json", function(additionalInfo){
			dispatch(additionalInfoGetSuccess(additionalInfo));
		});
		//TODO: Handle error
	};
};

export function saveAdditionalInfo(additionalInfo){
	return function(dispatch){
		dispatch(additionalInfoPostReq(additionalInfo));

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + "auditor/additional-api",
			data: JSON.stringify(additionalInfo),
			contentType: "application/json"
		});
		req.done(function(additionalInfo){
			console.log("success",additionalInfo);
			dispatch(additionalInfoPostSuccess(additionalInfo));
			hashHistory.push("/details");
		});
		req.fail(function(error){
			dispatch(additionalInfoPostError(error.responseJSON));
		});
	};
};

export function fetchClients(){
	return function(dispatch){
		dispatch(clientGetReq());

		$.get( url.api_base_path + "manager/client", function(clients){
			dispatch(clientGetSuccess(clients));
		});
		//TODO: Handle error
	};
};

export function fetchClient(clientId){
	return function(dispatch){
		dispatch(clientIdGetRequest(clientId));

		$.get( url.api_base_path + `manager/client/${clientId}`, function(client){
			dispatch(clientIdGetSuccess(client));
		});
		//TODO: Handle error
	};
};

export function loadClientAddForm(){
	return function(dispatch){
		dispatch({
			type: types.CLIENT_FORM_LOAD_SUC,
		});
	};
};

export function loadClientEditForm(clientId){
	return function(dispatch){
		dispatch({
			type: types.CLIENT_FORM_LOAD_REQ,
			clientId: clientId
		});
		dispatch(fetchClient(clientId));
	};
};

export function saveClientEditForm(client){
	return function(dispatch){
		dispatch({
			type: types.CLIENT_FORM_SUB_REQ,
		});
		dispatch({
			type: types.CLIENT_ID_POST_REQ,
			client: client
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + `manager/client/${client.id}`,
			data: JSON.stringify(client),
			contentType: "application/json"
		});
		req.done(function(savedClient){
			dispatch({
				type: types.CLIENT_ID_POST_SUC,
				client: savedClient
			});
			dispatch({
				type: types.CLIENT_FORM_SUB_SUC,
			});
			hashHistory.push("/client");
		});
		req.fail(function(error){
			dispatch({
				type: types.CLIENT_ID_POST_ERR,
				errors: error.responseJSON
			});
			dispatch({
				type: types.CLIENT_FORM_SUB_ERR,
			});
		});
	};
};

export function saveClientAddForm(client){
	return function(dispatch){
		dispatch({
			type: types.CLIENT_FORM_SUB_REQ,
		});
		dispatch({
			type: types.CLIENT_POST_REQ,
			client: client
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + "manager/client",
			data: JSON.stringify(client),
			contentType: "application/json"
		});
		req.done(function(savedClient){
			dispatch({
				type: types.CLIENT_POST_SUC,
				client: savedClient
			});
			dispatch({
				type: types.CLIENT_FORM_SUB_SUC,
			});
			hashHistory.push("/client");
		});
		req.fail(function(error){
			dispatch({
				type: types.CLIENT_POST_ERR,
				errors: error.responseJSON
			});
			dispatch({
				type: types.CLIENT_FORM_SUB_ERR,
			});
		});
	};
};

export function fetchAuditors(){
	return function(dispatch){
		dispatch({
			type: types.AUDITOR_GET_REQ
		});

		$.get( url.api_base_path + "manager/auditor", function(auditors){
			dispatch({
				type: types.AUDITOR_GET_SUC,
				auditors: auditors
			});
		});
		//TODO: Handle error
	};
};

export function fetchAuditor(auditorId){
	return function(dispatch){
		dispatch({
			type: types.AUDITOR_ID_GET,
			status: 'request',
			auditorId: auditorId
		});

		$.get( url.api_base_path + `manager/auditor/${auditorId}`, function(auditor){
			dispatch({
				type: types.AUDITOR_ID_GET,
				status: 'success',
				auditor: auditor
			});
		});
		//TODO: Handle error
	};
};

export function fetchProfileInfoForAuditor(auditorId){
	return function(dispatch){
		dispatch({
			type: types.AUDITOR_GET_PROFILE_INFO,
			status: 'request',
			auditorId: auditorId
		});

		$.get( url.api_base_path + `manager/auditor/${auditorId}/profile_info`, function(profileInfo){
			dispatch({
				type: types.AUDITOR_GET_PROFILE_INFO,
				status: 'success',
				profileInfo: profileInfo,
			});
		});
		//TODO: Handle error
	};
};

export function fetchBankInfoForAuditor(auditorId){
	return function(dispatch){
		dispatch({
			type: types.AUDITOR_GET_BANK_INFO,
			status: 'request',
			auditorId: auditorId
		});

		$.get( url.api_base_path + `manager/auditor/${auditorId}/bank_info`, function(bankInfo){
			dispatch({
				type: types.AUDITOR_GET_BANK_INFO,
				status: 'success',
				bankInfo: bankInfo,
			});
		});
		//TODO: Handle error
	};
};

export function fetchAdditionalInfoForAuditor(auditorId){
	return function(dispatch){
		dispatch({
			type: types.AUDITOR_GET_ADDITIONAL_INFO,
			status: 'request',
			auditorId: auditorId
		});

		$.get( url.api_base_path + `manager/auditor/${auditorId}/additional_info`, function(additionalInfo){
			dispatch({
				type: types.AUDITOR_GET_ADDITIONAL_INFO,
				status: 'success',
				additionalInfo: additionalInfo,
			});
		});
		//TODO: Handle error
	};
};

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

export function fetchCities(){
	return function(dispatch){
		dispatch({
			type: types.CITY_GET,
			status: 'request',
		});

		$.get( url.api_base_path + "manager/city", function(cities){
			dispatch({
				type: types.CITY_GET,
				status: 'success',
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
