import $ from "jquery";
import { url } from "../../../config.js";

export function findModerators(){
	return $.get( url.api_base_path + "manager/moderator");
}


export function findById(moderatorId){
	return $.get( url.api_base_path + `manager/moderator/${moderatorId}`);
}


export function findByAuditCycle(auditCycleId){
	return $.get( url.api_base_path + `manager/audit_cycle/${auditCycleId}/moderator`);
}

export function assign(auditCycleId, userId){
	return $.ajax({
		url: url.api_base_path + `manager/audit_cycle/${auditCycleId}/moderator`,
		method: "POST",
		data: JSON.stringify({
			user_id: userId
		}),
		contentType: "application/json"
	});
}

export function revoke(auditCycleId, userId){
	return $.ajax({
		url: url.api_base_path + `manager/audit_cycle/${auditCycleId}/moderator`,
		type: "DELETE",
		data: JSON.stringify({
			user_id: userId
		}),
		contentType: "application/json"
	});
}

export function insert( email, password, is_active){
	return $.ajax({
		url: url.api_base_path + "manager/moderator",
		method: "POST",
		data: JSON.stringify({
			email,
			password,
			is_active
		}),
		contentType: "application/json"
	});
}

export function update(moderatorId, email, password, is_active){
	return $.ajax({
		url: url.api_base_path + `manager/moderator/${moderatorId}`,
		method: "POST",
		data: JSON.stringify({
			email,
			password,
			is_active
		}),
		contentType: "application/json"
	});
}

export function findModeratorSummaryByAuditCycle(auditCycleId){
	return $.get( url.api_base_path + `manager/audit_cycle/${auditCycleId}/moderator_summary`);
}

export function findModeratorSummary(){
	return $.get( url.api_base_path + "manager/moderator/summary");
}

export function findReportsById(moderatorId){
	return $.get(url.api_base_path + `manager/moderator/${moderatorId}/reportlist`);
}