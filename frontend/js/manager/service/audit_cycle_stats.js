import $ from "jquery";
import { url } from "../../../config.js";

export function fetchApplicationStats(audit_cycle_id){
	return $.get( url.api_base_path + `manager/audit_cycle/${audit_cycle_id}/application_stats`);
}

export function fetchAuditStoreStats(audit_cycle_id){
	return $.get( url.api_base_path + `manager/audit_cycle/${audit_cycle_id}/audit_store_stats`);
}
