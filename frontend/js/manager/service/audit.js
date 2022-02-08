import $ from "jquery";
import { url } from "../../../config.js";

export function copyAuditsFromTo(fromAuditCycleId, toAuditCycleId){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + `manager/audit_cycle/${toAuditCycleId}/audit/copy`,
		data: JSON.stringify({
			from_audit_cycle_id: fromAuditCycleId
		}),
		contentType: "application/json"
	});
}


export function fetchAudits(auditCycleId){
	return $.get( url.api_base_path + `manager/audit_cycle/${auditCycleId}/audit` );
	//TODO: Handle error
}