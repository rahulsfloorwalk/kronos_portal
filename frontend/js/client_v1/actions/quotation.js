import types from "../action_types.js";
import { get_uncomplete_quotation_by_client as _get_uncomplete_quotation_by_client } from "../service/quotation.js";

export function get_uncomplete_quotation_by_client(clientId){
	return function(dispatch){

		return _get_uncomplete_quotation_by_client(clientId).done(function(quotation){
			dispatch({
				type: types.FIND_UNCOMPLETE_QUOTATION,
				status: "success",
				quotation,
			});
		});
	};
}