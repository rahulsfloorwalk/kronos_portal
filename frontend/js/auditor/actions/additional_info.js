import $ from "jquery";
import { url } from "../../../config";
import { hashHistory } from "react-router";
import types from "../action_types.js";

/**
 * These are the action creators as mentioned here: http://redux.js.org/docs/basics/ExampleTodoList.html#action-creators
 * Call them with arguments (if any) to create action objects that you can pass to dispatch(...)
 */

function additionalInfoGetReq(){
	return {
		type: types.ADDITIONAL_INFO_GET,
		status: "request",
	};
}
function additionalInfoGetSuccess(additionalInfo){
	return {
		type: types.ADDITIONAL_INFO_GET,
		status: "success",
		additionalInfo: additionalInfo
	};
}
function additionalInfoPostReq(additionalInfo){
	return {
		type: types.ADDITIONAL_INFO_POST,
		status: "request",
		additionalInfo: additionalInfo
	};
}
function additionalInfoPostSuccess(additionalInfo){
	return {
		type: types.ADDITIONAL_INFO_POST,
		status: "success",
		additionalInfo: additionalInfo
	};
}
function additionalInfoPostError(errors){
	return {
		type: types.ADDITIONAL_INFO_POST,
		status: "error",
		errors: errors
	};
}

/**
 * These are also action creators which employ redux-thunk so that we can return a function(dispatch) instead of a plain action.
 * This allows you to configure the returned function with parameters ala factories.
 */

export function fetchAdditionalInfo(){
	return function(dispatch){
		dispatch(additionalInfoGetReq());

		return $.get( url.api_base_path + "auditor/additional_info", function(additionalInfo){
			dispatch(additionalInfoGetSuccess(additionalInfo));
		});
		//TODO: Handle error
	};
}

export function saveAdditionalInfo(additionalInfo){
	return function(dispatch){
		dispatch(additionalInfoPostReq(additionalInfo));

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + "auditor/additional_info",
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
}
