import $ from "jquery";
import { url } from "../../../config";
import types from "../action_types.js";

/**
 * These are the action creators as mentioned here: http://redux.js.org/docs/basics/ExampleTodoList.html#action-creators
 * Call them with arguments (if any) to create action objects that you can pass to dispatch(...)
 */

function socialInfoGetReq(){
	return {
		type: types.SOCIAL_INFO_GET,
		status: "request",
	};
}
function socialInfoGetSuccess(socialInfo){
	return {
		type: types.SOCIAL_INFO_GET,
		status: "success",
		socialInfo: socialInfo
	};
}
function socialInfoPostReq(socialInfo){
	return {
		type: types.SOCIAL_INFO_POST,
		status: "request",
		socialInfo: socialInfo
	};
}
function socialInfoPostSuccess(socialInfo){
	return {
		type: types.SOCIAL_INFO_POST,
		status: "success",
		socialInfo: socialInfo
	};
}
function socialInfoPostError(errors){
	return {
		type: types.SOCIAL_INFO_POST,
		status: "error",
		errors: errors
	};
}
/**
 * These are also action creators which employ redux-thunk so that we can return a function(dispatch) instead of a plain action.
 * This allows you to configure the returned function with parameters ala factories.
 */

export function fetchFacebookInfo(){
	return function(dispatch){
		dispatch(socialInfoGetReq());

		return $.get( url.api_base_path + "auditor/facebook_info", function(socialInfo){
			dispatch(socialInfoGetSuccess(socialInfo));
		});
		//TODO: Handle error
	};
}

export function saveFacebookInfo(fbResponse, accessToken){
	return function(dispatch){
		dispatch(socialInfoPostReq(fbResponse));
		let req = $.ajax({
			type: "POST",
			url: url.api_base_path + "auditor/facebook_info",
			data: JSON.stringify({
				access_token: accessToken,
				facebook_id: fbResponse.id,
				profile_data: fbResponse,
				is_verified: true,
			}),
			contentType: "application/json"
		});
		req.done(function(socialInfo){
			dispatch(socialInfoPostSuccess(socialInfo));
		});
		req.fail(function(error){
			dispatch(socialInfoPostError(error.responseJSON));
		});

		return req;
	};
}
