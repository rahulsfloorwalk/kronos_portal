import $ from "jquery";
import { url } from "../../../config.js";

export function getDashboardAuditCycles(){
	return $.get( url.api_base_path + "client_v1/audit_cycle/dashboard");
}


export function getDashboardSummaryAuditCycles(){
	return $.get( url.api_base_path + "client_v1/audit_cycle/dashboard/summary");
}
