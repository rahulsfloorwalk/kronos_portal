import $ from "jquery";
import { url } from "../../../config.js";


export function uploadFileForImportQuestionnaire(auditCycleId, file) {

	var formData = new FormData();
	formData.append("file", file);

	return $.ajax({
		type: "POST",
		url: url.api_base_path + `manager/audit_cycle/${auditCycleId}/import_questionnaire`,
		processData: false,
		contentType: false,
		data: formData,
	});
}