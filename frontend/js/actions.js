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

export function fetchClient(clientId, successCallback = ()=>{}){
	return function(dispatch){
		dispatch(clientIdGetRequest(clientId));

		$.get( url.api_base_path + `manager/client/${clientId}`, function(client){
			dispatch(clientIdGetSuccess(client));
			successCallback(client);
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
		dispatch(fetchClient(clientId, function(client){
			dispatch({
				type: types.CLIENT_FORM_LOAD_SUC,
				clientId: clientId
			});
		}));
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
		req.done(function(client){
			dispatch({
				type: types.CLIENT_ID_POST_SUC,
				client: client
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
		if( client.id){
			dispatch({
				type: types.CLIENT_POST_REQ,
				client: client
			});
		} else {
			dispatch({
				type: types.CLIENT_POST_REQ,
				client: client
			});
		}

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + "manager/client",
			data: JSON.stringify(client),
			contentType: "application/json"
		});
		req.done(function(client){
			dispatch({
				type: types.CLIENT_POST_SUC,
				client: client
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
