import $ from 'jquery'
import { url } from '../config'
import { hashHistory } from 'react-router';


export var types = {
	PROFILE_INFO_GET_REQ: 'PROFILE_INFO_REQ',
	PROFILE_INFO_GET_ERR: 'PROFILE_INFO_ERR',
	PROFILE_INFO_GET_SUC: 'PROFILE_INFO_SUC',

	PROFILE_INFO_POST_REQ: 'PROFILE_INFO_POST_REQ',
	PROFILE_INFO_POST_ERR: 'PROFILE_INFO_POST_ERR',
	PROFILE_INFO_POST_SUC: 'PROFILE_INFO_POST_SUC',

	BANK_INFO_REQ: 'BANK_INFO_REQ',
	BANK_INFO_ERR: 'BANK_INFO_ERR',
	BANK_INFO_RECV: 'BANK_INFO_RECV',

	ADDITIONAL_DETAILS_REQ: 'ADDITIONAL_DETAILS_REQ',
	ADDITIONAL_DETAILS_ERR: 'ADDITIONAL_DETAILS_ERR',
	ADDITIONAL_DETAILS_RECV: 'ADDITIONAL_DETAILS_RECV',
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
export function profileInfoGetSuccess(profileInfo){
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

/*
function requestBankInfo(){
	return {
		type: types.BANK_INFO_REQ,
	};
};
function receiveBankInfo(bankInfo){
	return {
		type: types.BANK_INFO_RECV,
		bankInfo: bankInfo
	};
};

function requestAdditionalInfo(listId){
	return {
		type: types.ADDITIONAL_DETAILS_REQ,
	};
};
function receiveAdditionalInfo(additionalInfo){
	return {
		type: types.ADDITIONAL_DETAILS_RECV,
		additionalInfo: additionalInfo,
	};
};
*/

/**
 * These are the action creators which employ redux-thunk so that we can return a function(dispatch) instead of a plain action.
 * This allows you to configure the returned function with parameters ala factories.
 */
export function fetchProfileInfo(){
	return function(dispatch){
		dispatch(profileInfoGetReq());

		$.get( url.api_base_path + "auditor/profile-api?format=json", function(profileInfo){
			dispatch(profileInfoGetSuccess(profileInfo));
		});
		//Handle error
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

/*
export function fetchBankInfo(){
	return function(dispatch){
		dispatch(requestBankInfo());

		$.get(config.api_base_path, function(bankInfo){
			dispatch(receiveBankInfo(bankInfo));
		});
		//Handle error
	};
};

export function fetchAdditionalInfo(){
	return function(dispatch){
		//requesting cards for a list...
		dispatch(requestAdditionalInfo());

		$.get(config.api_base_path, function(additionalInfo){
			dispatch(receiveAdditionalInfo(additionalInfo));
		});
		//Handle error
	};
};
*/

