import $ from "jquery";
import { url } from "../../../config.js";

export function fetchLatestAuditStores(){
	return $.get( url.api_base_path + "client/audit_store/latest");
}

export function fetchUpcomingAuditStores(){
	return $.get( url.api_base_path + "client/audit_store/upcoming");
}

export function fetchAuditStoresByStore(storeId){
	return $.get( url.api_base_path + `client/store/${storeId}/audit_store`);
}

export function fetchAuditStore(auditStoreId){
	return $.get( url.api_base_path + `client/audit_store/${auditStoreId}`);
}

export function fetchAuditStoreByAuditCycleAndStore(auditCycleId, storeId){
	return $.get( url.api_base_path + `client/report/audit_cycle/${auditCycleId}/store/${storeId}/audit_store`);
}

export function findAuditStoresByAuditCycle(auditCycleId){
	return $.get( url.api_base_path + `client/report/audit_cycle/${auditCycleId}/audit_store`);
}

export function getReportActionPlan(auditStoreId){
	return $.get(url.api_base_path + `client/audit_store/${auditStoreId}/report_action`);
}

export function submitReportActionPlan(auditStoreId, action_plan, target_date, person){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + `client/audit_store/${auditStoreId}/report_action`,
		data: JSON.stringify({
			action_plan: action_plan,
			target_date: target_date,
			person: person
		}),
		contentType: "application/json"
	});
}

export function submitAuditStorePDFReport(email_receiver_list, audit_store_id, audit_report){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + "client/audit_feedback_report_mail",
		data: JSON.stringify({
			email_receiver_list: email_receiver_list,
			audit_report: audit_report,
			audit_store_id: audit_store_id
		}),
		contentType: "application/json"
	});
}