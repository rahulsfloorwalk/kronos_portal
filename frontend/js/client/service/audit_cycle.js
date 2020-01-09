import $ from "jquery";
import { url } from "../../../config.js";

export function fetchAuditCycles(){
	return $.get( url.api_base_path + "client/audit_cycle");
}

export function fetchAuditCyclesForDashboard(){
	return $.get( url.api_base_path + "client/audit_cycle_for_dashboard");
}
