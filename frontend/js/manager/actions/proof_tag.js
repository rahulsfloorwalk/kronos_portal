import $ from "jquery";
import { url } from "../../../config.js";

export function fetchproofTag(audit_cycle_id){
	return $.get( url.api_base_path + `manager/audit_cycle/${audit_cycle_id}/proof_tag`);
}

export function saveproofTag(audit_cycle_id, proof_tag_list){
	return $.ajax({
		url: url.api_base_path + `manager/audit_cycle/${audit_cycle_id}/proof_tag`,
		method: "POST",
		data: JSON.stringify({
			proof_tag_list
		}),
		contentType: "application/json"
	});
}
