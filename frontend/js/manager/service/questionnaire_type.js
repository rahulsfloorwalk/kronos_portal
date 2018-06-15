import $ from "jquery";
import { url } from "../../../config.js";

export function fetchQuestionnaireTypes(clientId){
	return $.get( url.api_base_path + `manager/client/${clientId}/questionnaire_type`);
}

export function fetchQuestionnaireType(questionnaireTypeId){
	return $.get( url.api_base_path + `manager/questionnaire_type/${questionnaireTypeId}`);
}

export function createQuestionnaireType(name, client, is_default){
	return $.ajax({
		method: "POST",
		url: url.api_base_path + "manager/questionnaire_type",
		data: JSON.stringify({
			name,
			is_default,
			client,
		}),
		contentType: "application/json"
	});
}

export function saveQuestionnaireType(questionnaireTypeId, name, client, is_default){
	return $.ajax({
		method: "POST",
		url: url.api_base_path + `manager/questionnaire_type/${questionnaireTypeId}`,
		data: JSON.stringify({
			name,
			is_default,
			client,
		}),
		contentType: "application/json"
	});
}
