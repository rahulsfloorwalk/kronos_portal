import $ from "jquery";
import { url } from "../../../config.js";
import types from "../action_types.js";

export function fiatAssignAudit(audit_id, email, audit_date){
	var promise = $.ajax({
		url: url.api_base_path + `manager/audit/${audit_id}/assign`,
		method: "POST",
		data: JSON.stringify({
			email,
			audit_date
		}),
		contentType: "application/json"
	});
	return promise;
}

export function findById(application_id){
	return $.get(url.api_base_path + `manager/application/${application_id}`);
}

export function findByAudit(audit_id){
	return $.get(url.api_base_path + `manager/audit/${audit_id}/application`);
}

export function rejectAllForAudit(audit_id){
	return $.ajax({
		url: url.api_base_path + `manager/audit/${audit_id}/application/deny_all`,
		method: "POST",
		contentType: "application/json"
	});
	return promise;
}

export function rejectAllForAuditCycle(audit_cycle_id){
	return $.ajax({
		url: url.api_base_path + `manager/audit_cycle/${audit_cycle_id}/application/deny_all`,
		method: "POST",
		contentType: "application/json"
	});
}

export function waitListApplication(application_id){
	return $.ajax({
		url: url.api_base_path + `manager/application/${application_id}/waitlist`,
		method: "POST",
		contentType: "application/json"
	});
}
