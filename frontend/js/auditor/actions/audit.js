import $ from "jquery";
import { url } from "../../../config";
import types from "../action_types.js";

export function fetchAudits(data){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_GET,
			status: "request",
		});

		return $.get( url.api_base_path + "auditor/audit", data, function(audits){
			dispatch({
				type: types.AUDIT_GET,
				status: "success",
				audits
			});
		});
		//TODO: Handle error
	};
}

export function fetchAudit(auditId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_ID_GET,
			status: "request",
			auditId: auditId
		});

		return $.get( url.api_base_path + `auditor/audit/${auditId}`, function(audit){
			dispatch({
				type: types.AUDIT_ID_GET,
				status: "success",
				audit: audit
			});
		});
		//TODO: Handle error
	};
}
