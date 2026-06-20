import $ from "jquery";
import { url } from "../../../config.js";

export function getDashboardAuditCycles(){
	return $.get( url.api_base_path + "manager/audit_cycle/dashboard");
}

export function getDashboardAuditCyclesdropdown(){
	return $.get( url.api_base_path + "manager/audit_cycle/dashboard/client/dropdown");
}

export function getDashboardClientAuditCycles(client_id, status) {
	return $.get (url.api_base_path + `manager/audit_cycle/client_dashboard?client_id=${client_id}&status=${status}`);
}

export function getDashboardPMDetails(role){
	return $.get( url.api_base_path + `manager/audit_cycle/dashboard/workload/?role=${role}`);

}