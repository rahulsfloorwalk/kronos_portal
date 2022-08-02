import $ from "jquery";
import { url } from "../../../config.js";

export function fetchIndustry(){
	return $.get( url.api_base_path + "client_v1/quotation/industry");
}

export function fetchAuditCategory(){
	return $.get( url.api_base_path + "client_v1/quotation/audit_category");
}

export function fetchAuditType(){
	return $.get( url.api_base_path + "client_v1/quotation/audit_type");
}

export function fetchQuotationPreview(quotation){
	return $.ajax({
		method: "POST",
		url: url.api_base_path + "client_v1/quotation/preview",
		data: JSON.stringify(quotation),
		contentType: "application/json"
	});
}

export function addQuotation(client_id, quotation){
	return $.ajax({
		method: "POST",
		url: url.api_base_path + `client_v1/client/${client_id}/quotation`,
		data: JSON.stringify(quotation),
		contentType: "application/json"
	});
}

export function findQuotationById(quotation_id){
	return $.get( url.api_base_path + `client_v1/quotation/${quotation_id}`);
}

export function get_uncomplete_quotation_by_client(client_id){
	return $.get( url.api_base_path + `client_v1/client/${client_id}/quotation/uncomplete`);
}

export function find_audit_cycle_for_quotation(quotation_id){
	return $.get( url.api_base_path + `client_v1/quotation/${quotation_id}/audit_cycle_preview`);
}