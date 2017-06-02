import $ from 'jquery'
import { url } from '../../../config'
import types from '../action_types.js'

export function fetchAnswers(auditStoreId){
	return function(dispatch){
		dispatch({
			type: types.ANSWER_GET,
			status: 'request',
			auditStoreId
		});

		return $.get( url.api_base_path + `manager/audit_store/${auditStoreId}/answer`, function(answers){
			dispatch({
				type: types.ANSWER_GET,
				status: 'success',
				answers
			});
		});
		//TODO: Handle error
	};
};


export function setMarks(answer){
	return function(dispatch){
		dispatch({
			type: types.ANSWER_MARK,
			status: 'request',
			answer
		});

		var payload = { marks: answer.marks };

		return $.ajax({
			url: url.api_base_path + `manager/audit_store/${answer.auditStoreId}/question/${answer.questionId}/mark`,
			type: "POST",
			data: JSON.stringify(payload),
			contentType: "application/json"

		}).then(function(answer){
			dispatch({
				type: types.ANSWER_MARK,
				status: 'success',
				answer
			});
		});
		//TODO: Handle error
	};
};

export function setAnswerNotApplicable(auditStoreId, questionId, notApplicable){
	return function(dispatch){
		dispatch({
			type: types.ANSWER_NOT_APPLICABLE,
			status: 'request',
			auditStoreId,
			questionId,
			notApplicable,
		});

		return $.ajax({
			url: url.api_base_path + `manager/audit_store/${auditStoreId}/question/${questionId}/not_applicable`,
			type: "POST",
			data: JSON.stringify({
				not_applicable: notApplicable
			}),
			contentType: "application/json"

		}).then(function(answer){
			dispatch({
				type: types.ANSWER_NOT_APPLICABLE,
				status: 'success',
				answer
			});
		});
		//TODO: Handle error
	};
};
