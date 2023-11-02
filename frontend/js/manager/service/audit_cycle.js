import $ from "jquery";
import { url } from "../../../config.js";

export function fetchAuditCyclesByClient(clientId){
	return $.get( url.api_base_path + `manager/client/${clientId}/audit_cycle`);
}

export function findAuditCyclesByClientLoadMore(is_load_more, audit_cycle_count,clientId){
	return $.get( url.api_base_path + `manager/client/${clientId}/audit_cycle?is_load_more=${is_load_more}&last_total_count=${audit_cycle_count}`);
}

export function copyAuditDetailsFromTo(state_data, toauditCycleId){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + `manager/audit_cycle/${toauditCycleId}/copy_audit_details`,
		data: JSON.stringify({
			from_audit_cycle_id: state_data["selectedAuditCycleId"],
			checkpoints: state_data["checkpoints"],
			post_approval_desc: state_data["post_approval_desc"],
			proof_tags: state_data["proof_tags"],
			audit_alignment_factors: state_data["audit_alignment_factors"],
		}),
		contentType: "application/json"
	});
}

export function filterAuditCycleByManager(managerId, month, year){
	return $.ajax({
		url: url.api_base_path + `manager/audit_cycle/${managerId}/manager`,
		method: "POST",
		data: JSON.stringify({
			"manager_id": managerId,
			"month": month,
			"year": year
		}),
		contentType: "application/json"
	});
}

export function fetchDashboardAuditCyclesByClient(clientId){
	return $.get( url.api_base_path + `manager/client/${clientId}/audit_cycle_dashboard`);
}

export function setAuditAlignmentFactors(state_data, auditCycleId){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + `manager/audit_cycle/${auditCycleId}/audit_alignment_factors`,
		data: JSON.stringify({
			gender: state_data["gender"],
			education: state_data["education"],
			income: state_data["income"],
			car_cost: state_data["car_cost"],
			occupation: state_data["occupation"],
			interest_area: state_data["interest_area"],
			marital_status: state_data["marital_status"],
			report_rating: state_data["report_rating"],
			auditor_rating: state_data["auditor_rating"],
			date_availability: state_data["date_availability"],
			auditor_age_range: state_data["auditor_age_range"],
		}),
		contentType: "application/json"
	});
}