import $ from 'jquery'
import { url } from '../../../config'
import types from '../action_types.js';
import { hashHistory } from 'react-router';

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

