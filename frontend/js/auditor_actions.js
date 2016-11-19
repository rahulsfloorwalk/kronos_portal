import $ from 'jquery'
import { url } from '../config'
import { hashHistory } from 'react-router';


export var types = {
	/*Profile Info Action Types*/
	PROFILE_INFO_GET_REQ: 'PROFILE_INFO_REQ',
	PROFILE_INFO_GET_ERR: 'PROFILE_INFO_ERR',
	PROFILE_INFO_GET_SUC: 'PROFILE_INFO_SUC',

	PROFILE_INFO_POST_REQ: 'PROFILE_INFO_POST_REQ',
	PROFILE_INFO_POST_ERR: 'PROFILE_INFO_POST_ERR',
	PROFILE_INFO_POST_SUC: 'PROFILE_INFO_POST_SUC',

	/*Bank Info Action Types*/
	BANK_INFO_GET_REQ: 'BANK_INFO_GET_REQ',
	BANK_INFO_GET_ERR: 'BANK_INFO_GET_ERR',
	BANK_INFO_GET_SUC: 'BANK_INFO_GET_SUC',

	BANK_INFO_POST_REQ: 'BANK_INFO_POST_REQ',
	BANK_INFO_POST_ERR: 'BANK_INFO_POST_ERR',
	BANK_INFO_POST_SUC: 'BANK_INFO_POST_SUC',

	/*Additional Info Action Types*/
	ADDITIONAL_INFO_GET_REQ: 'ADDITIONAL_INFO_GET_REQ',
	ADDITIONAL_INFO_GET_ERR: 'ADDITIONAL_INFO_GET_ERR',
	ADDITIONAL_INFO_GET_SUC: 'ADDITIONAL_INFO_GET_SUC',

	ADDITIONAL_INFO_POST_REQ: 'ADDITIONAL_INFO_POST_REQ',
	ADDITIONAL_INFO_POST_ERR: 'ADDITIONAL_INFO_POST_ERR',
	ADDITIONAL_INFO_POST_SUC: 'ADDITIONAL_INFO_POST_SUC',

	AUDIT_GET: 'AUDIT_GET',
	AUDIT_ID_GET: 'AUDIT_ID_GET',

	AUDIT_ID_GET_APPLICATIONS: 'AUDIT_ID_GET_APPLICATIONS',

	AUDIT_APPLY_FORM_LOAD: 'AUDIT_APPLY_FORM_LOAD',
	AUDIT_APPLY_FORM_SUB: 'AUDIT_APPLY_FORM_SUB',

	AUDIT_CANCEL_FORM_LOAD: 'AUDIT_CANCEL_FORM_LOAD',
	AUDIT_CANCEL_FORM_SUB: 'AUDIT_CANCEL_FORM_SUB',

	//State get
	STATE_GET: 'STATE_GET',
	//City get
	CITY_GET: 'CITY_GET',
};

/**
 * These are the action creators as mentioned here: http://redux.js.org/docs/basics/ExampleTodoList.html#action-creators
 * Call them with arguments (if any) to create action objects that you can pass to dispatch(...)
 */
function profileInfoGetReq(){
	return {
		type: types.PROFILE_INFO_GET_REQ,
	};
};
function profileInfoGetSuccess(profileInfo){
	return {
		type: types.PROFILE_INFO_GET_SUC,
		profileInfo: profileInfo
	};
};
function profileInfoPostReq(profileInfo){
	return {
		type: types.PROFILE_INFO_POST_REQ,
		profileInfo: profileInfo
	};
};
function profileInfoPostSuccess(profileInfo){
	return {
		type: types.PROFILE_INFO_POST_SUC,
		profileInfo: profileInfo
	};
};
function profileInfoPostError(errors){
	return {
		type: types.PROFILE_INFO_POST_ERR,
		errors: errors
	};
};

function bankInfoGetReq(){
	return {
		type: types.BANK_INFO_GET_REQ
	};
};
function bankInfoGetSuccess(bankInfo){
	return {
		type: types.BANK_INFO_GET_SUC,
		bankInfo: bankInfo
	};
};
function bankInfoPostReq(bankInfo){
	return {
		type: types.BANK_INFO_POST_REQ,
		bankInfo: bankInfo
	};
};
function bankInfoPostSuccess(bankInfo){
	return {
		type: types.BANK_INFO_POST_SUC,
		bankInfo: bankInfo
	};
};
function bankInfoPostError(errors){
	return {
		type: types.BANK_INFO_POST_ERR,
		errors: errors
	};
};

function additionalInfoGetReq(){
	return {
		type: types.ADDITIONAL_INFO_GET_REQ
	};
};
function additionalInfoGetSuccess(additionalInfo){
	return {
		type: types.ADDITIONAL_INFO_GET_SUC,
		additionalInfo: additionalInfo
	};
};
function additionalInfoPostReq(additionalInfo){
	return {
		type: types.ADDITIONAL_INFO_POST_REQ,
		additionalInfo: additionalInfo
	};
};
function additionalInfoPostSuccess(additionalInfo){
	return {
		type: types.ADDITIONAL_INFO_POST_SUC,
		additionalInfo: additionalInfo
	};
};
function additionalInfoPostError(errors){
	return {
		type: types.ADDITIONAL_INFO_POST_ERR,
		errors: errors
	};
};

/**
 * These are also action creators which employ redux-thunk so that we can return a function(dispatch) instead of a plain action.
 * This allows you to configure the returned function with parameters ala factories.
 */
export function fetchProfileInfo(){
	return function(dispatch){
		dispatch(profileInfoGetReq());

		return $.get( url.api_base_path + "auditor/profile-api?format=json", function(profileInfo){
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

		return req;
	};
};

export function fetchBankInfo(){
	return function(dispatch){
		dispatch(bankInfoGetReq());

		return $.get( url.api_base_path + "auditor/bank-api?format=json", function(bankInfo){
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

		return req;
	};
};

export function fetchAdditionalInfo(){
	return function(dispatch){
		dispatch(additionalInfoGetReq());

		return $.get( url.api_base_path + "auditor/additional-api?format=json", function(additionalInfo){
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

		return req;
	};
};

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

export function fetchStates(){
	return function(dispatch){
		dispatch({
			type: types.STATE_GET,
			status: 'request',
		});

		return $.get( url.api_base_path + "auditor/state", function(states){
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

		return $.get( url.api_base_path + `auditor/city/${stateCode}`, function(cities){
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

