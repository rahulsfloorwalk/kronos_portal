import $ from "jquery";
import { url } from "../../../config.js";

export function fetchAuditCyclesByClient(clientId){
	return $.get( url.api_base_path + `manager/client/${clientId}/audit_cycle`);
}

export function copyAuditDetailsFromTo(state_data, toauditCycleId){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + `manager/audit_cycle/${toauditCycleId}/copy_audit_details`,
		data: JSON.stringify({
			from_audit_cycle_id: state_data["selectedAuditCycleId"],
			checkpoints: state_data["checkpoints"],
			post_approval_desc: state_data["post_approval_desc"],
			proof_tags: state_data["proof_tags"]
		}),
		contentType: "application/json"
	});
}
