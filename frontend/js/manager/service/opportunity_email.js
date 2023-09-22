import $ from "jquery";
import { url } from "../../../config.js";

export function findOpportunityEmailRecordsByAuditCycleId(audit_cycle_id){
	return $.get( url.api_base_path + `manager/audit_cycle/${audit_cycle_id}/opportunity_email`);
}

export function findOpportunitySMSRecordsByAuditCycleId(audit_cycle_id){
	return $.get( url.api_base_path + `manager/audit_cycle/${audit_cycle_id}/opportunity_sms`);
}

export function findOpportunityWhatsappRecordsByAuditCycleId(audit_cycle_id){
	return $.get( url.api_base_path + `manager/audit_cycle/${audit_cycle_id}/opportunity_whatsapp`);
}

export function fetchAuditAlignmentFactors(audit_cycle_id){
	return $.get( url.api_base_path + `manager/audit_cycle/${audit_cycle_id}/audit_alignment_factors`);
}

export function saveOpportunityEmailRecord(audit_cycle_id, filters){
	return $.ajax({
		url: url.api_base_path + `manager/audit_cycle/${audit_cycle_id}/opportunity_notification`,
		method: "POST",
		data: JSON.stringify(filters),
		contentType: "application/json"
	});
}


export function findAuditorCountOpportunityEmail(filters){
	return $.ajax({
		url: url.api_base_path + "manager/auditor/filter_count",
		method: "POST",
		data: JSON.stringify(filters),
		contentType: "application/json"
	});
}
export function findAuditorCountOpportunityEmailForAllLocation(filters,auditCycleId){
	return $.ajax({
		url: url.api_base_path + `manager/auditor/${auditCycleId}/all_filter_count`,
		method: "POST",
		data: JSON.stringify(filters),
		contentType: "application/json"
	});
}