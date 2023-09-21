import $ from "jquery";
import { url } from "../../../config.js";

export function fiatAssignAudit(audit_id, email, audit_date, earnings_per_audit, reimbursement, audit_count){
	var promise = $.ajax({
		url: url.api_base_path + `manager/audit/${audit_id}/assign`,
		method: "POST",
		data: JSON.stringify({
			email,
			audit_date,
			earnings_per_audit,
			reimbursement,
			audit_count
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

export function setAuditApplicationComment(application_id, comment){
	return $.ajax({
		url: url.api_base_path + `manager/application/${application_id}/comment`,
		method: "POST",
		data: JSON.stringify({
			comment
		}),
		contentType: "application/json"
	});
}
export function notificationWhatsappSendForPincode(auditCycleId,auditId,channel_name="whatsapp"){
	return $.ajax({
		url: url.api_base_path + `manager/audit_cycle/${auditCycleId}/opportunity_notification_for_pincode`,
		method: "POST",
		data: JSON.stringify({
			auditId,
			channel_name
		}),
		contentType: "application/json"
	});
}
export function notificationEmailSendForPincode(auditCycleId,auditId,channel_name="email"){
	return $.ajax({
		url: url.api_base_path + `manager/audit_cycle/${auditCycleId}/opportunity_notification_for_pincode`,
		method: "POST",
		data: JSON.stringify({
			auditId,
			channel_name
		}),
		contentType: "application/json"
	});
}
export function notificationAllWhatsappSendForPincode(auditCycleId,channel_name="whatsapp",format="all"){
	return $.ajax({
		url: url.api_base_path + `manager/audit_cycle/${auditCycleId}/opportunity_notification_for_pincode`,
		method: "POST",
		data: JSON.stringify({
			channel_name,
			format
		}),
		contentType: "application/json"
	});
}
export function notificationAllEmailSendForPincode(auditCycleId,channel_name="email",format="all"){
	return $.ajax({
		url: url.api_base_path + `manager/audit_cycle/${auditCycleId}/opportunity_notification_for_pincode`,
		method: "POST",
		data: JSON.stringify({
			channel_name,
			format
		}),
		contentType: "application/json"
	});
}