import $ from "jquery";
import { url } from "../../../config.js";

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

export function acceptAllReports(audit_cycle_id){
	return $.post( url.api_base_path + `manager/audit_cycle/${audit_cycle_id}/audit_store/accept`);
}
