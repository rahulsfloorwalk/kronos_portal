import $ from "jquery";
import { url } from "../../../config.js";

export function fetchReportSections(auditStoreId){
	return $.get( url.api_base_path + `client/audit_store/${auditStoreId}/report_section`);
}


export function searchStorePerformance(percentage, questionnaire_id){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + "client/store_performance",
		data: JSON.stringify({
			percentage: percentage,
			questionnaire_id: questionnaire_id
		}),
		contentType: "application/json"
	});
}
