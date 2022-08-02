import $ from "jquery";
import { url } from "../../../config.js";

export function copyAuditsFromTo(fromAuditCycleId, toAuditCycleId){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + `client_v1/audit_cycle/${toAuditCycleId}/audit/copy`,
		data: JSON.stringify({
			from_audit_cycle_id: fromAuditCycleId
		}),
		contentType: "application/json"
	});
}

export function addAuditForm(auditCycleId, audit_data){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + `client_v1/audit_cycle/${auditCycleId}/audit`,
		data: JSON.stringify({
			audit_data: audit_data
		}),
		contentType: "application/json"
	});
}