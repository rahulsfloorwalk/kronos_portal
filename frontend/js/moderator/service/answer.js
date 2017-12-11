import $ from 'jquery'
import { url } from '../../../config.js'

export function fetchAnswers(auditStoreId){
	return $.get( url.api_base_path + `moderator/audit_store/${auditStoreId}/answer`);
};

export function setAnswerText(auditStoreId, questionId, answer_text){
	return $.ajax({
		url: url.api_base_path + `moderator/audit_store/${auditStoreId}/question/${questionId}/answer_text`,
		method: 'POST',
		data: JSON.stringify({
			answer_text
		}),
		contentType: 'application/json'
	});
};

export function setAnswerComment(audit_store_id, question_id, answer_comment){
	return $.ajax({
		url: url.api_base_path + `moderator/audit_store/${audit_store_id}/question/${question_id}/answer_comment`,
		method: 'POST',
		data: JSON.stringify({
			answer_comment
		}),
		contentType: 'application/json'
	});
};

export function setMarks(auditStoreId, questionId, marks_obtained){
	return $.ajax({
		url: url.api_base_path + `moderator/audit_store/${auditStoreId}/question/${questionId}/marks_obtained`,
		type: "POST",
		data: JSON.stringify({
			marks_obtained
		}),
		contentType: "application/json"
	});
};

export function setAnswerNotApplicable(auditStoreId, questionId, not_applicable){
	return $.ajax({
		url: url.api_base_path + `moderator/audit_store/${auditStoreId}/question/${questionId}/not_applicable`,
		type: "POST",
		data: JSON.stringify({
			not_applicable
		}),
		contentType: "application/json"
	});
};
