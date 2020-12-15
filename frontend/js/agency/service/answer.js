import axios from "axios";

export function fetchAnswers(auditStoreId){
	return axios.get(`/agency/audit_store/${auditStoreId}/answer`).then( r => r.data);
}

export function setAnswerText(auditStoreId, questionId, answerText, status){
	return axios.post(`/agency/audit_store/${auditStoreId}/question/${questionId}/answer`, {
		answer_text: answerText,
		status: status
	}).then( r => r.data);
}

export function setAnswerComment(auditStoreId, questionId, answerComment){
	return axios.post(`/agency/audit_store/${auditStoreId}/question/${questionId}/answer_comment`, {
		answer_comment: answerComment,
	}).then( r => r.data);
}

