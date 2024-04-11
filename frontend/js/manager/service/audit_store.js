import $ from "jquery";
import { url } from "../../../config.js";

export function failReport(audit_store_id, message) {
	return $.ajax({
		url: url.api_base_path + `manager/audit_store/${audit_store_id}/fail`,
		method: "POST",
		data: JSON.stringify({
			message
		}),
		contentType: "application/json"
	});
}
export function setAuditDate(audit_store_id, audit_date){
	return $.ajax({
		url: url.api_base_path + `manager/audit_store/${audit_store_id}/audit_date`,
		method: "POST",
		data: JSON.stringify({
			audit_date
		}),
		contentType: "application/json"
	});
}
export function setAuditModeratorStatus(audit_store_id, moderator_status){
	return $.ajax({
		url: url.api_base_path + `manager/audit_store/${audit_store_id}/moderator_status`,
		method: "POST",
		data: JSON.stringify({
			moderator_status
		}),
		contentType: "application/json"
	});
}
export function setAuditModeratorComment(audit_store_id, moderator_comment){
	return $.ajax({
		url: url.api_base_path + `manager/audit_store/${audit_store_id}/moderator_comment`,
		method: "POST",
		data:JSON.stringify({
			moderator_comment
		}),
		contentType:"application/json"
	});
}

export function saveCheckList(audii_store_id, check_list){
	return $.ajax({
		url: url.api_base_path+ `manager/audit_store/${audii_store_id}/check_points`,
		method: "POST",
		data: JSON.stringify({
			check_points:check_list
		}),
		contentType: "application/json"
	});
}


export function rate(audit_store_id, qa_rating){
	return $.ajax({
		url: url.api_base_path + `manager/audit_store/${audit_store_id}/qa_rating`,
		method: "POST",
		data: JSON.stringify({
			qa_rating
		}),
		contentType: "application/json"
	});
}

export function auditor_rate(audit_store_id, auditor_rating){
	return $.ajax({
		url: url.api_base_path + `manager/audit_store/${audit_store_id}/auditor_rating`,
		method: "POST",
		data: JSON.stringify({
			auditor_rating
		}),
		contentType: "application/json"
	});
}

export function unSubmitAuditStore(audit_store_id, reason){
	return $.ajax({
		url: url.api_base_path + `manager/audit_store/${audit_store_id}/unsubmit`,
		method: "POST",
		data: JSON.stringify({
			reason: reason,
		}),
		contentType: "application/json",
	});
}


export function setReimbursement(audit_store_id, reimbursement){
	return $.ajax({
		url: url.api_base_path + `manager/audit_store/${audit_store_id}/reimbursement`,
		method: "POST",
		data: JSON.stringify({
			reimbursement
		}),
		contentType: "application/json"
	});
}

export function setFollowUpByAuditStore(audit_store_id, comment, next_follow_up_date){
	return $.ajax({
		url: url.api_base_path + `manager/audit_store/${audit_store_id}/follow_up`,
		method: "POST",
		data: JSON.stringify({
			comment,
			next_follow_up_date
		}),
		contentType: "application/json"
	});
}

export function setReportAttributeValue(audit_store_id, attribute_json_id, attribute_option_id){
	return $.ajax({
		url: url.api_base_path + `manager/audit_store/${audit_store_id}/report_attribute`,
		method: "POST",
		data: JSON.stringify({
			json_id: attribute_json_id,
			option_id: attribute_option_id,
		}),
		contentType: "application/json",
	});
}

export function setReportSummary(audit_store_id, report_summary){
	return $.ajax({
		url: url.api_base_path + `manager/audit_store/${audit_store_id}/report_summary`,
		method: "POST",
		data: JSON.stringify({
			report_summary: report_summary,
		}),
		contentType: "application/json",
	});
}

export function setEarningsPerAudit(audit_store_id, earnings_per_audit){
	return $.ajax({
		url: url.api_base_path + `manager/audit_store/${audit_store_id}/earnings_per_audit`,
		method: "POST",
		data: JSON.stringify({
			earnings_per_audit
		}),
		contentType: "application/json"
	});
}

export function assignAuditStoreToClientUser(audit_store_id, client_user_id){
	return $.ajax({
		url: url.api_base_path + `manager/audit_store/${audit_store_id}/client_user`,
		method: "POST",
		data: JSON.stringify({
			client_user_id
		}),
		contentType: "application/json"
	});
}

export function revokeAuditStoreFromClientUser(audit_store_id, client_user_id){
	return $.ajax({
		url: url.api_base_path + `manager/audit_store/${audit_store_id}/client_user`,
		method: "DELETE",
		data: JSON.stringify({
			client_user_id
		}),
		contentType: "application/json"
	});
}

export function findAuditStoresByAudit(audit_id){
	return $.get(url.api_base_path + `manager/audit/${audit_id}/audit_store`);
}

export function findAuditStoresByAuditCycle(audit_cycle_id){
	return $.get(url.api_base_path + `manager/audit_cycle/${audit_cycle_id}/audit_store`);
}

export function getUserList(audit_cycle_id){
	return $.get(url.api_base_path + `manager/audit_cycle/${audit_cycle_id}/user_list_for_reports_filter`);
}

export function findAuditStoresByAuditCycleNew(audit_cycle_id, data){
	return $.get(url.api_base_path + `manager/audit_cycle/${audit_cycle_id}/audit_store_list`, data);
}

export function findAuditStoresByAuditCycleReportList(audit_cycle_id,reportId){
	return $.get(url.api_base_path + `manager/audit_cycle/${audit_cycle_id}/audit_store/${reportId}/audit_list`);
}

export function assignToModerator(auditStoreId, userId){
	return $.ajax({
		url: url.api_base_path + `manager/audit_store/${auditStoreId}/moderator`,
		method: "POST",
		data: JSON.stringify({
			user_id: userId
		}),
		contentType: "application/json"
	});
}

export function revokeFromModerator(auditStoreId){
	return $.ajax({
		url: url.api_base_path + `manager/audit_store/${auditStoreId}/moderator`,
		type: "DELETE",
	});
}

export function acceptAllReports(audit_cycle_id, filters = {}){
	return $.post( url.api_base_path + `manager/audit_cycle/${audit_cycle_id}/audit_store/accept`,filters);
}

export function arrangeAttachment(auditStoreId){
	return $.post(url.api_base_path + `manager/audit_store/${auditStoreId}/arrange_attachment`);
}

export function find_recent_audit_store_by_user_id(user_id){
	return $.get(url.api_base_path + `manager/auditor/${user_id}/completed_accepted_reports`);
}