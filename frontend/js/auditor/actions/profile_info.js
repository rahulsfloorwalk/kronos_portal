import $ from "jquery";
import { url } from "../../../config";
import { hashHistory } from "react-router";
import types from "../action_types.js";
/**
 * These are the action creators as mentioned here: http://redux.js.org/docs/basics/ExampleTodoList.html#action-creators
 * Call them with arguments (if any) to create action objects that you can pass to dispatch(...)
 */
function profileInfoGetReq(){
	return {
		type: types.PROFILE_INFO_GET,
		status: "request",
	};
}
function profileInfoGetSuccess(profileInfo){
	return {
		type: types.PROFILE_INFO_GET,
		status: "success",
		profileInfo: profileInfo
	};
}
function profileInfoPostReq(profileInfo){
	return {
		type: types.PROFILE_INFO_POST,
		status: "request",
		profileInfo: profileInfo
	};
}
function profileInfoPostSuccess(profileInfo){
	return {
		type: types.PROFILE_INFO_POST,
		status: "success",
		profileInfo: profileInfo
	};
}
function profileInfoPostError(errors){
	return {
		type: types.PROFILE_INFO_POST,
		status: "error",
		errors: errors
	};
}

/**
 * These are also action creators which employ redux-thunk so that we can return a function(dispatch) instead of a plain action.
 * This allows you to configure the returned function with parameters ala factories.
 */

export function _fetchProfileInfo(){
	return $.get( url.api_base_path + "auditor/profile_info");
}

export function fetchProfileInfo(){
	return function(dispatch){
		dispatch(profileInfoGetReq());

		return _fetchProfileInfo().done(function(profileInfo){
			dispatch(profileInfoGetSuccess(profileInfo));
		});
		//TODO: Handle error
	};
}

export function saveProfileInfo(profileInfo){
	return function(dispatch){
		dispatch(profileInfoPostReq(profileInfo));

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + "auditor/profile_info",
			data: JSON.stringify(profileInfo),
			contentType: "application/json"
		});
		req.done(function(profileInfo){
			dispatch(profileInfoPostSuccess(profileInfo));
			hashHistory.push("/details");
		});
		req.fail(function(error){
			dispatch(profileInfoPostError(error.responseJSON));
		});

		return req;
	};
}

export function setMobileNumber(mobile_number,dial_code){
	return function(dispatch){

		let req = $.ajax({
			type: "POST",
			url: url.api_base_path + "auditor/mobile_number",
			data: JSON.stringify({mobile_number,dial_code}),
			contentType: "application/json"
		});
		req.then((profileInfo) => {
			dispatch(profileInfoPostSuccess(profileInfo));
		}, (error) => {
			dispatch(profileInfoPostError(error.responseJSON));
		});

		return req;
	};
}

export function setWhatsappNumber(whatsapp_number,whatsapp_dial_code){
	return function(dispatch){

		let req = $.ajax({
			type: "POST",
			url: url.api_base_path + "auditor/whatsapp_number",
			data: JSON.stringify({whatsapp_number,whatsapp_dial_code}),
			contentType: "application/json"
		});
		req.then((profileInfo) => {
			dispatch(profileInfoPostSuccess(profileInfo));
		}, (error) => {
			dispatch(profileInfoPostError(error.responseJSON));
		});

		return req;
	};
}
export function setCertificationMarks(marks){
	return function(dispatch){

		let req = $.ajax({
			type: "POST",
			url: url.api_base_path + "auditor/certification_marks",
			data: JSON.stringify({marks}),
			contentType: "application/json"
		});
		req.then((profileInfo) => {
			dispatch(profileInfoPostSuccess(profileInfo));
		}, (error) => {
			dispatch(profileInfoPostError(error.responseJSON));
		});

		return req;
	};
}