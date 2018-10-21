import $ from "jquery";
import { url } from "../../../config.js";

export function fetchReportAttributesByAuditCycleId(auditCycleId){
	return $.get( url.api_base_path + `manager/audit_cycle/${auditCycleId}/report_attribute`);
}