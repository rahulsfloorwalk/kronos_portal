import $ from "jquery";
import { url } from "../../../config.js";

export function copySectionsFromTo(fromAuditCycleId, toAuditCycleId){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + `manager/audit_cycle/${toAuditCycleId}/section/copy`,
		data: JSON.stringify({
			from_audit_cycle_id: fromAuditCycleId
		}),
		contentType: "application/json"
	});
}

