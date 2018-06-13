import $ from "jquery";
import { url } from "../../../config.js";

export function fetchQuestionnaireTypes(clientId){
	return $.get( url.api_base_path + `manager/client/${clientId}/questionnaire_type`);
}

export function createQuestionnaireType(name, client, is_default){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + "manager/questionnaire_type",
		data: JSON.stringify({
			name,
			is_default,
			client,
		}),
		contentType: "application/json"
	});
}
