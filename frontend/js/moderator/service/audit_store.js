import $ from "jquery";
import { url } from "../../../config.js";

export function findPending(){
	return $.get(url.api_base_path + "moderator/audit_store/pending");
}

export function findCompleted(){
	return $.get(url.api_base_path + "moderator/audit_store/completed");
}

export function findByAuditCycleId(auditCycleId){
	return $.get(url.api_base_path + `moderator/audit_cycle/${auditCycleId}/audit_store`);
};

export function findById(auditStoreId){
	return $.get(url.api_base_path + `moderator/audit_store/${auditStoreId}`);
};

export function submit(auditStoreId){
	return $.post(url.api_base_path + `moderator/audit_store/${auditStoreId}/submit`);
};

export function unsubmit(auditStoreId){
	return $.post(url.api_base_path + `moderator/audit_store/${auditStoreId}/unsubmit`);
};

export function fail(auditStoreId){
	return $.post(url.api_base_path + `moderator/audit_store/${auditStoreId}/fail`);
};

export function complete(auditStoreId){
	return $.post(url.api_base_path + `moderator/audit_store/${auditStoreId}/complete`);
}

export function setAuditDate(auditStoreId, auditDate){
	return $.ajax({
		url: url.api_base_path + `moderator/audit_store/${auditStoreId}/audit_date`,
		type: "POST",
		data: JSON.stringify({
			audit_date: auditDate
		}),
		contentType: "application/json"
	});
};

export function rate(auditStoreId, qa_rating){
	return $.ajax({
		url: url.api_base_path + `moderator/audit_store/${auditStoreId}/qa_rating`,
		method: "POST",
		data: JSON.stringify({
			qa_rating
		}),
		contentType: "application/json"
	});
}
