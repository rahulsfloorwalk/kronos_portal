import $ from "jquery";
import { url } from "../../../config.js";

export function fetchQuestionnaireTypes(){
	return $.get( url.api_base_path + "client_v1/questionnaire_type");
}

export function fetchQuestionnaireType(questionnaireTypeId){
	return $.get( url.api_base_path + `client_v1/questionnaire_type/${questionnaireTypeId}`);
}

export function createQuestionnaireType(name, client, is_default){
	return $.ajax({
		method: "POST",
		url: url.api_base_path + "client_v1/questionnaire_type",
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
		url: url.api_base_path + `client_v1/questionnaire_type/${questionnaireTypeId}`,
		data: JSON.stringify({
			name,
			is_default,
			client,
		}),
		contentType: "application/json"
	});
}

export function deleteQuestionnaireType(questionnaireTypeId){
	return $.ajax({
		method: "DELETE",
		url: url.api_base_path + `client_v1/questionnaire_type/${questionnaireTypeId}`,
	});
}
