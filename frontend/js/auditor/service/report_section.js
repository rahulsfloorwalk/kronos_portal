import $ from "jquery";
import { url } from "../../../config.js";

// export function saveReportModal(auditStoreId,submitModalform){
// 	return $.ajax({
// 		url: url.api_base_path + `auditor/audit_store/${auditStoreId}/report_feedback`,
// 		type: "POST",
// 		data: JSON.stringify({form:submitModalform}),
// 		contentType: "application/json"
// 	});
// }


export function saveReportModal(auditStoreId, understanding_rating,rating,submitModalform) {
	const formData = {
		audit_understanding: understanding_rating || "",
		coordination: rating|| "",
		portal_accessibility: submitModalform || ""
	};

	return $.ajax({
		url: url.api_base_path + `auditor/audit_store/${auditStoreId}/report_feedback`,
		type: "POST",
		data: JSON.stringify(formData),
		contentType: "application/json"
	});
}
