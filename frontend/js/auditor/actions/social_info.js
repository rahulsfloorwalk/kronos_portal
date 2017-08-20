import $ from 'jquery'
import { url, facebook_fields } from '../../../config'
import { hashHistory } from 'react-router';
import types from '../action_types.js';

/**
 * These are the action creators as mentioned here: http://redux.js.org/docs/basics/ExampleTodoList.html#action-creators
 * Call them with arguments (if any) to create action objects that you can pass to dispatch(...)
 */

function socialInfoGetReq(){
	return {
		type: types.SOCIAL_INFO_GET,
		status: 'request',
	};
};
function socialInfoGetSuccess(socialInfo){
	return {
		type: types.SOCIAL_INFO_GET,
		status: 'success',
		socialInfo: socialInfo
	};
};
function socialInfoGetError(errors){
	return {
		type: types.SOCIAL_INFO_GET,
		status: 'error',
		errors: errors
	};
};
function socialInfoPostReq(socialInfo){
	return {
		type: types.SOCIAL_INFO_POST,
		status: 'request',
		socialInfo: socialInfo
	};
};
function socialInfoPostSuccess(socialInfo){
	return {
		type: types.SOCIAL_INFO_POST,
		status: 'success',
		socialInfo: socialInfo
	};
};
function socialInfoPostError(errors){
	return {
		type: types.SOCIAL_INFO_POST,
		status: 'error',
		errors: errors
	};
};
/**
 * These are also action creators which employ redux-thunk so that we can return a function(dispatch) instead of a plain action.
 * This allows you to configure the returned function with parameters ala factories.
 */

export function fetchFacebookData(socialInfo, access_token){
	if(!access_token){
		return function(dispatch){
			dispatch(socialInfoGetError({"message":"Access Denied by user"}));
		}
	}
	let data_url = "https://graph.facebook.com/v2.10/me?access_token=" + access_token + "&debug=all&fields=" + facebook_fields + "&format=json&method=get&pretty=0&suppress_http_code=1"
	return function(dispatch){
		dispatch(socialInfoGetReq());
		return $.get( data_url, function(facebook_data){
				dispatch(saveFacebookInfo(socialInfo, facebook_data, access_token))
		});
		//TODO: Handle error
	};
};

export function fetchFacebookInfo(){
	return function(dispatch){
		dispatch(socialInfoGetReq());

		return $.get( url.api_base_path + "auditor/facebook_info", function(socialInfo){
			dispatch(socialInfoGetSuccess(socialInfo));
		});
		//TODO: Handle error
	};
};

export function saveFacebookInfo(socialInfo, facebook_data, accessToken){
	return function(dispatch){
		dispatch(socialInfoPostReq(socialInfo, facebook_data, accessToken));
		socialInfo['access_token'] = accessToken;
		socialInfo['facebook_id'] = facebook_data.id;
		socialInfo['profile_data'] = facebook_data;
		socialInfo['is_verified'] = true;
		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + "auditor/facebook_info",
			data: JSON.stringify(socialInfo),
			contentType: "application/json"
		});
		req.done(function(socialInfo){
			console.log("success",socialInfo);
			dispatch(socialInfoPostSuccess(socialInfo));
		});
		req.fail(function(error){
			dispatch(socialInfoPostError(error.responseJSON));
		});

		return req;
	};
};
