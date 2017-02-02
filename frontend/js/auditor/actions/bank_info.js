import $ from 'jquery'
import { url } from '../../../config'
import { hashHistory } from 'react-router';
import types from '../action_types.js';

/**
 * These are the action creators as mentioned here: http://redux.js.org/docs/basics/ExampleTodoList.html#action-creators
 * Call them with arguments (if any) to create action objects that you can pass to dispatch(...)
 */

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

/**
 * These are also action creators which employ redux-thunk so that we can return a function(dispatch) instead of a plain action.
 * This allows you to configure the returned function with parameters ala factories.
 */

export function fetchBankInfo(){
	return function(dispatch){
		dispatch(bankInfoGetReq());

		return $.get( url.api_base_path + "auditor/bank_info", function(bankInfo){
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
			url: url.api_base_path + "auditor/bank_info",
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

		return req;
	};
};
