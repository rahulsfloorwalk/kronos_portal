import types from "../action_types.js";

import { fetchClient as _fetchClient, fetchAccountBalance as _fetchAccountBalance } from "../service/client.js";

export function fetchClient(){
	return function(dispatch){
		dispatch({
			type: types.FETCH_CLIENT,
			status: "request",
		});

		return _fetchClient().done(function(client){
			dispatch({
				type: types.FETCH_CLIENT,
				status: "success",
				client
			});
		});
		//TODO: Handle error
	};
}

export function fetchAccountBalance(){
	return function(dispatch){
		return _fetchAccountBalance().done(function(balance){
			dispatch({
				type: types.FETCH_ACCOUNT_BALANCE,
				status: "success",
				balance
			});
		});
	};
}