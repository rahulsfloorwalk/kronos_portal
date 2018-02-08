import $ from "jquery";
import { url } from "../../../config";
import types from "../action_types.js";

import { saveBankInfo as __saveBankInfo } from "../service/bank_info.js";

/**
 * These are also action creators which employ redux-thunk so that we can return a function(dispatch) instead of a plain action.
 * This allows you to configure the returned function with parameters ala factories.
 */

export function fetchBankInfo(){
	return function(dispatch){
		dispatch({
			type: types.BANK_INFO_GET,
			status: "request",
		});

		return $.get( url.api_base_path + "auditor/bank_info", function(bankInfo){
			dispatch({
				type: types.BANK_INFO_GET,
				status: "success",
				bankInfo: bankInfo
			});
		});
		//TODO: Handle error
	};
}

export function saveBankInfo(bankInfo){
	return function(dispatch){
		let req = __saveBankInfo(bankInfo);
		req.done(function(bankInfo){
			dispatch({
				type: types.BANK_INFO_POST,
				status: "success",
				bankInfo: bankInfo
			});
		});
		return req;
	};
}
