import $ from "jquery";
import { url } from "../../../config.js";

export function fetchAuditorExecutionReport(auditCycleId){
	return $.get(url.api_base_path + `manager/audit_cycle/${auditCycleId}/auditor_execution_report`);
}

export function fetchAuditorExecutionReports(auditCycleId, userId, status){
	return $.get(url.api_base_path + `manager/audit_cycle/${auditCycleId}/auditor/${userId}/execution_reports/`, { status });
}