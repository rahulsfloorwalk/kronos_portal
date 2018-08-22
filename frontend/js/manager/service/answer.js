import $ from "jquery";
import { url } from "../../../config.js";

export function setAnswerText(audit_store_id, question_id, answer_text){
	return $.ajax({
		url: url.api_base_path + `manager/audit_store/${audit_store_id}/question/${question_id}/answer_text`,
		method: "POST",
		data: JSON.stringify({
			answer_text
		}),
		contentType: "application/json"
	});
}

export function setAnswerComment(audit_store_id, question_id, answer_comment){
	return $.ajax({
		url: url.api_base_path + `manager/audit_store/${audit_store_id}/question/${question_id}/answer_comment`,
		method: "POST",
		data: JSON.stringify({
			answer_comment
		}),
		contentType: "application/json"
	});
}

