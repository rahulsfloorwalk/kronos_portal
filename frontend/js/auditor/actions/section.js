import $ from "jquery";
import { url } from "../../../config";
import types from "../action_types.js";

export function fetchSections(auditStoreId){
	return function(dispatch){
		dispatch({
			type: types.SECTION_GET,
			status: "request",
			auditStoreId
		});

		return $.get( url.api_base_path + `auditor/audit_store/${auditStoreId}/section`, function(sections){
			dispatch({
				type: types.SECTION_GET,
				status: "success",
				sections
			});
		});
		//TODO: Handle error
	};
}

