import $ from "jquery";
import { url } from "../../../config.js";

export function findQuestionById(questionId){
	return $.get( url.api_base_path + `manager/question/${questionId}`);
}

export function saveQuestion(question){
	var req_url = url.api_base_path + "manager/question";
	if( question.id){
		req_url += `/${question.id}`;
	}
	var req = $.ajax({
		type: "POST",
		url: req_url,
		data: JSON.stringify(question),
		contentType: "application/json"
	});
	return req;
}

export function deleteQuestion(questionId){
	return $.ajax({
		url: url.api_base_path + `manager/question/${questionId}`,
		type: "DELETE",
	});
}
