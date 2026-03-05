import $ from "jquery";
import { url } from "../../../config.js";

export function findPending(lastAuditStoreDate, filterStatus, client){
	// return $.get(url.api_base_path + "moderator/audit_store/pending");
	return $.ajax({
		url: url.api_base_path + "moderator/audit_store/pending",
		method: "POST",
		data: JSON.stringify({
			lastAuditStoreDate: lastAuditStoreDate,
			filterStatus: filterStatus,
			client_id: client
		}),
		contentType: "application/json"
	});
}

export function findCompleted(lastAuditStoreDate, filterStatus, client, month, year){
	// return $.get(url.api_base_path + "moderator/audit_store/completed");
	return $.ajax({
		url: url.api_base_path + "moderator/audit_store/completed",
		method: "POST",
		data: JSON.stringify({
			lastAuditStoreDate: lastAuditStoreDate,
			filterStatus: filterStatus,
			client_id: client,
			month: month,
			year: year
		}),
		contentType: "application/json"
	});
}

export function findByAuditCycleId(auditCycleId){
	return $.get(url.api_base_path + `moderator/audit_cycle/${auditCycleId}/audit_store`);
}

export function findById(auditStoreId){
	return $.get(url.api_base_path + `moderator/audit_store/${auditStoreId}`);
}

export function findMandatoryProofTags(auditStoreId){
	return $.get(url.api_base_path + `moderator/audit_store/${auditStoreId}/mandatory_proof_tag`);
}

export function findProofNotAvailable(auditStoreId){
	return $.get(url.api_base_path + `moderator/audit_store/${auditStoreId}/proof_not_available`);
}

export function findStoreByClientId(clientId){
	return $.get(url.api_base_path + `moderator/client/${clientId}/store`);
}

export function submit(auditStoreId){
	return $.post(url.api_base_path + `moderator/audit_store/${auditStoreId}/submit`);
}

export function unsubmit(auditStoreId, reason, missing_proofs){
	return $.ajax({
		url: url.api_base_path + `moderator/audit_store/${auditStoreId}/unsubmit`,
		method: "POST",
		data: JSON.stringify({
			reason: reason,
			missing_proofs: missing_proofs
		}),
		contentType: "application/json"
	});
}

export function fail(auditStoreId){
	return $.post(url.api_base_path + `moderator/audit_store/${auditStoreId}/fail`);
}
export function failReport(auditStoreId, message, moderator_submission_time){
	return $.ajax({
		url:url.api_base_path + `moderator/audit_store/${auditStoreId}/fail`,
		method: "POST",
		data: JSON.stringify({
			message,
			moderator_submission_time
		}),
		contentType: "application/json"
	});
}
export function navigateToReport(payload){
	return $.ajax({
		url:url.api_base_path + "moderator/audit_store/report_submission_time",
		method: "POST",
		data: JSON.stringify(payload),
		contentType: "application/json"
	});
}

// export function qaOk(auditStoreId){
// 	return $.post(url.api_base_path + `moderator/audit_store/${auditStoreId}/qa_ok`);
// }
export function qaOk(auditStoreId, payload){
	return $.ajax({
		url:url.api_base_path + `moderator/audit_store/${auditStoreId}/qa_ok`,
		method: "POST",
		data: JSON.stringify({
			moderator_submission_time : payload
		}),
		contentType: "application/json"
	});
}

export function logoutTimer(payload){
	return $.ajax({
		url: url.api_base_path + "moderator/audit_store/report_submission_time",
		method: "POST",
		data: JSON.stringify(payload),
		contentType: "application/json"
	});
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

export function setStoreStatus(store,audit_store_id,audit_cycle){
	return $.ajax({
		url: url.api_base_path + "moderator/audit",
		method: "POST",
		data: JSON.stringify({
			store,
			audit_store_id,
			audit_cycle
		}),
		contentType: "application/json"
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

export function rate(auditStoreId, qa_rating, qa_feedback_rating){
	return $.ajax({
		url: url.api_base_path + `moderator/audit_store/${auditStoreId}/qa_rating`,
		method: "POST",
		data: JSON.stringify({
			qa_rating,
			qa_feedback_rating
		}),
		contentType: "application/json"
	});
}

export function auditor_rate(auditStoreId, auditor_rating){
	return $.ajax({
		url: url.api_base_path + `moderator/audit_store/${auditStoreId}/auditor_rating`,
		method: "POST",
		data: JSON.stringify({
			auditor_rating
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

export function reWriteReportSummary(audit_store_id,report_summary){
	return $.ajax({
		url: url.api_base_path + `moderator/audit_store/${audit_store_id}/rewrite_report_summary`,
		// url: "http://api.floorwalk.in/rewrite/",
		method: "POST",
		data: JSON.stringify({
			report_summary: report_summary,
		}),
		contentType: "application/json",
	});
}

export function backToOriginalReportSummary(audit_store_id,report_summary){
	return $.ajax({
		url: url.api_base_path + `moderator/audit_store/${audit_store_id}/back_to_original_report_summary`,
		// url: "http://api.floorwalk.in/rewrite/",
		method: "POST",
		data: JSON.stringify({
			report_summary: report_summary,
		}),
		contentType: "application/json",
	});
}

export function arrangeAttachment(auditStoreId){
	return $.post(url.api_base_path + `moderator/audit_store/${auditStoreId}/arrange_attachment`);
}

export function FetchGuidlineByAuditStoreModerator(auditStoreId){
	return $.get(url.api_base_path + `moderator/audit_store/${auditStoreId}/guildlines`);
}