import $ from 'jquery'
import { url } from '../../../config.js'
import types from '../action_types.js';

export function fetchClientUsers(clientId){
	return function(dispatch){
		dispatch({
			type: types.CLIENT_USER_GET,
			status: 'request',
			clientId
		});

		return $.get( url.api_base_path + `manager/client/${clientId}/client_user`, function(clientUsers){
			dispatch({
				type: types.CLIENT_USER_GET,
				status: 'success',
				clientUsers
			});
		});
		//TODO: Handle error
	};
};

export function fetchClientUser(clientUserId){
	return function(dispatch){
		dispatch({
			type: types.CLIENT_USER_ID_GET,
			status: 'request',
			clientUserId
		});

		return $.get( url.api_base_path + `manager/client_user/${clientUserId}`, function(clientUser){
			dispatch({
				type: types.CLIENT_USER_ID_GET,
				status: 'success',
				clientUser
			});
		});
		//TODO: Handle error
	};
};

export function loadClientUserAddForm(){
	return function(dispatch){
		dispatch({
			type: types.CLIENT_USER_FORM_LOAD,
			status: 'success'
		});
	};
};

export function loadClientUserEditForm(clientUserId){
	return function(dispatch){
		dispatch({
			type: types.CLIENT_USER_FORM_LOAD,
			status: 'request',
			clientUserId
		});
		return dispatch(fetchClientUser(clientUserId));
	};
};

export function saveClientUserAddForm(clientUser){
	return function(dispatch){
		dispatch({
			type: types.CLIENT_USER_FORM_SUB,
			status: 'request',
			clientUser
		});
		dispatch({
			type: types.CLIENT_USER_POST,
			status: 'request',
			clientUser
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + "manager/client_user",
			data: JSON.stringify(clientUser),
			contentType: "application/json"
		});
		req.done(function(savedClientUser){
			dispatch({
				type: types.CLIENT_USER_POST,
				status: 'success',
				clientUser: savedClientUser
			});
			dispatch({
				type: types.CLIENT_USER_FORM_SUB,
				status: 'success',
				clientUser: savedClientUser
			});
		});
		req.fail(function(error){
			dispatch({
				type: types.CLIENT_USER_POST,
				status: 'error',
				errors: error.responseJSON || {}
			});
			dispatch({
				type: types.CLIENT_USER_FORM_SUB,
				status: 'error',
				errors: error.responseJSON || {}
			});
		});
		return req;
	};
};

export function saveClientUserEditForm(clientUser){
	return function(dispatch){
		dispatch({
			type: types.CLIENT_USER_FORM_SUB,
			status: 'request',
			clientUser
		});
		dispatch({
			type: types.CLIENT_USER_ID_POST,
			status: 'request',
			clientUser
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + `manager/client_user/${clientUser.id}`,
			data: JSON.stringify(clientUser),
			contentType: "application/json"
		});
		req.done(function(savedClientUser){
			dispatch({
				type: types.CLIENT_USER_ID_POST,
				status: 'success',
				clientUser: savedClientUser
			});
			dispatch({
				type: types.CLIENT_USER_FORM_SUB,
				status: 'success',
				clientUser: savedClientUser
			});
		});
		req.fail(function(error){
			dispatch({
				type: types.CLIENT_USER_FORM_SUB,
				status: 'error',
				errors: error.responseJSON || {}
			});
			dispatch({
				type: types.CLIENT_USER_ID_POST,
				status: 'error',
				errors: error.responseJSON || {}
			});
		});
		return req;
	};
};
