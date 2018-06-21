import $ from "jquery";
import { url } from "../../../config.js";

export function findAuditCycles(){
	return $.get(url.api_base_path + "moderator/audit_cycle");
}

export function findAuditCycleById(auditCycleId){
	return $.get(url.api_base_path + `moderator/audit_cycle/${auditCycleId}`);
}
