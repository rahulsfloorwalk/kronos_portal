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
}

export function findById(auditStoreId){
	return $.get(url.api_base_path + `moderator/audit_store/${auditStoreId}`);
}

export function submit(auditStoreId){
	return $.post(url.api_base_path + `moderator/audit_store/${auditStoreId}/submit`);
}

export function unsubmit(auditStoreId){
	return $.post(url.api_base_path + `moderator/audit_store/${auditStoreId}/unsubmit`);
}

export function fail(auditStoreId){
	return $.post(url.api_base_path + `moderator/audit_store/${auditStoreId}/fail`);
}

export function qaOk(auditStoreId){
	return $.post(url.api_base_path + `moderator/audit_store/${auditStoreId}/qa_ok`);
}

export function setAuditDate(auditStoreId, auditDate){
	return $.ajax({
		url: url.api_base_path + `moderator/audit_store/${auditStoreId}/audit_date`,
		method: "POST",
		data: JSON.stringify({
			audit_date: auditDate
		}),
		contentType: "application/json"
	});
}
export function setAuditModeratorStatus(audit_store_id, moderator_status){
	return $.ajax({
		url: url.api_base_path + `moderator/audit_store/${audit_store_id}/moderator_status`,
		method: "POST",
		data: JSON.stringify({
			moderator_status
		}),
		contentType: "application/json"
	});
}
export function setAuditModeratorComment(audit_store_id, moderator_comment){
	return $.ajax({
		url: url.api_base_path + `moderator/audit_store/${audit_store_id}/moderator_comment`,
		method: "POST",
		data:JSON.stringify({
			moderator_comment
		}),
		contentType:"application/json"
	});
}
export function saveCheckList(audit_store_id, check_points){
	return $.ajax({
		url: url.api_base_path+ `moderator/audit_store/${audit_store_id}/check_points`,
		method: "POST",
		data:JSON.stringify({
			check_points:check_points
		}),
		contentType: "application/json"
	});
}
export function setEarningsPerAudit(auditStoreId, earnings_per_audit){
	return $.ajax({
		url: url.api_base_path + `moderator/audit_store/${auditStoreId}/earnings_per_audit`,
		method: "POST",
		data: JSON.stringify({
			earnings_per_audit,
		}),
		contentType: "application/json"
	});
}

export function setReimbursement(auditStoreId, reimbursement){
	return $.ajax({
		url: url.api_base_path + `moderator/audit_store/${auditStoreId}/reimbursement`,
		method: "POST",
		data: JSON.stringify({
			reimbursement,
		}),
		contentType: "application/json"
	});
}

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
export function setReportSummary(audit_store_id, report_summary){
	return $.ajax({
		url: url.api_base_path + `moderator/audit_store/${audit_store_id}/report_summary`,
		method: "POST",
		data: JSON.stringify({
			report_summary: report_summary,
		}),
		contentType: "application/json",
	});
}
