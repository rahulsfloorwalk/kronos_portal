import $ from "jquery";
import { url } from "../../../config.js";

export function fetchAuditCycles(){
	return $.get( url.api_base_path + "client/audit_cycle");
}

export function findAuditCyclesByType(auditType){
	return $.get( url.api_base_path + `client/audit_cycle/${auditType}`);
}

