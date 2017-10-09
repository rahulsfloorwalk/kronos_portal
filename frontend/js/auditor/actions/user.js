import $ from 'jquery'
import { url } from '../../../config'
import types from '../action_types.js';

export function _fetchUser(){
	return $.get( url.api_base_path + "auditor/user");
};

export function fetchUser(){
	return function(dispatch){
		dispatch({
			type: types.USER_GET,
			status: 'request'
		});

		return _fetchUser().done(function(user){
			dispatch({
				type: types.USER_GET,
				status: 'success',
				user
			});
		});
		//TODO: Handle error
	};
};

