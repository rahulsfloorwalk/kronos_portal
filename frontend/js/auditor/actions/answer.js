import $ from "jquery";
import { url } from "../../../config";
import types from "../action_types.js";

export function fetchAnswers(auditStoreId){
	return function(dispatch){
		dispatch({
			type: types.ANSWER_GET,
			status: "request",
			auditStoreId
		});

		return $.get( url.api_base_path + `auditor/audit_store/${auditStoreId}/answer`, function(answers){
			dispatch({
				type: types.ANSWER_GET,
				status: "success",
				answers
			});
		});
		//TODO: Handle error
	};
}

export function submitAnswer(answer){
	return function(dispatch){
		dispatch({
			type: types.ANSWER_POST,
			status: "request",
			answer
		});

		var payload = {
			audit_store: answer.audit_store,
			answer_text: answer.answer_text,
			status: answer.status
		};
		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + `auditor/question/${answer.question}/answer`,
			data: JSON.stringify(payload),
			contentType: "application/json"
		});
		req.done(function(newAnswer){
			dispatch({
				type: types.ANSWER_POST,
				status: "success",
				answer: newAnswer,
			});
		});
		//TODO: Handle error
		return req;
	};
}


export function submitAnswerComment(audit_store_id, question_id, answer_comment){
	return function(dispatch){
		let req = $.ajax({
			type: "POST",
			url: url.api_base_path + `auditor/question/${question_id}/answer_comment`,
			data: JSON.stringify({
				audit_store_id,
				question_id,
				answer_comment
			}),
			contentType: "application/json"
		});
		req.done(function(newAnswer){
			dispatch({
				type: types.ANSWER_POST,
				status: "success",
				answer: newAnswer,
			});
		});
		//TODO: Handle error
		return req;
	};
}

export function postNotAvailable(audit_store_id,q_id,payload){
	return $.ajax({
		url: url.api_base_path + `auditor/audit_store/${audit_store_id}/question/${q_id}/not_applicable`,
		method: "POST",
		data: JSON.stringify({
			not_applicable: payload
		}),
		contentType: "application/json"
	});
}
