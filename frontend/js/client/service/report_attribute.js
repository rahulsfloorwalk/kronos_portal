import $ from "jquery";
import { url } from "../../../config.js";

export function fetchReportAttributesByAuditCycleId(audit_cycle_id){
	return $.get( url.api_base_path + `client/audit_cycle/${audit_cycle_id}/report_attribute`);
}
