import $ from 'jquery'
import { url } from '../../../config.js'
import types from '../action_types.js';

/**
 * These are the action creators as mentioned here: http://redux.js.org/docs/basics/ExampleTodoList.html#action-creators
 * Call them with arguments (if any) to create action objects that you can pass to dispatch(...)
 */

function clientGetReq(){
	return {
		type: types.CLIENT_GET,
		status: 'request',
	};
}
function clientGetSuccess(clients){
	return {
		type: types.CLIENT_GET,
		status: 'success',
		clients: clients
	};
}
function clientGetError(errors){
	return {
		type: types.CLIENT_GET,
		status: 'error',
		errors: errors
	};
}

function clientIdGetRequest(id){
	return {
		type: types.CLIENT_ID_GET,
		status: 'request',
		id: id
	};
}
function clientIdGetSuccess(client){
	return {
		type: types.CLIENT_ID_GET,
		status: 'success',
		client: client
	};
}
function clientIdGetError(){
	return {
		type: types.CLIENT_ID_GET,
		status: 'error',
		errors: errors
	};
}

/**
 * These are also action creators which employ redux-thunk so that we can return a function(dispatch) instead of a plain action.
 * This allows you to configure the returned function with parameters ala factories.
 */

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

		return $.get( url.api_base_path + `manager/client/${clientId}`, function(client){
			dispatch(clientIdGetSuccess(client));
		});
		//TODO: Handle error
	};
};

export function loadClientAddForm(){
	return function(dispatch){
		dispatch({
			type: types.CLIENT_FORM_LOAD,
			status: 'success',
		});
	};
};

export function loadClientEditForm(clientId){
	return function(dispatch){
		dispatch({
			type: types.CLIENT_FORM_LOAD,
			status: 'request',
			clientId: clientId
		});
		dispatch(fetchClient(clientId));
	};
};

export function saveClientEditForm(client){
	return function(dispatch){
		dispatch({
			type: types.CLIENT_FORM_SUB,
			status: 'request',
		});
		dispatch({
			type: types.CLIENT_ID_POST,
			status: 'request',
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
				type: types.CLIENT_ID_POST,
				status: 'success',
				client: savedClient
			});
			dispatch({
				type: types.CLIENT_FORM_SUB,
				status: 'success',
			});
		});
		req.fail(function(error){
			dispatch({
				type: types.CLIENT_ID_POST,
				status: 'error',
				errors: error.responseJSON
			});
			dispatch({
				type: types.CLIENT_FORM_SUB,
				status: 'error',
			});
		});
		return req;
	};
};

export function saveClientAddForm(client){
	return function(dispatch){
		dispatch({
			type: types.CLIENT_FORM_SUB,
			status: 'request',
		});
		dispatch({
			type: types.CLIENT_POST,
			status: 'request',
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
				type: types.CLIENT_POST,
				status: 'success',
				client: savedClient
			});
			dispatch({
				type: types.CLIENT_FORM_SUB,
				status: 'success',
			});
		});
		req.fail(function(error){
			dispatch({
				type: types.CLIENT_POST,
				status: 'error',
				errors: error.responseJSON
			});
			dispatch({
				type: types.CLIENT_FORM_SUB,
				status: 'error',
			});
		});
		return req;
	};
};
