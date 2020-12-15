import { FETCH_ANSWERS, FETCH_ANSWER } from "../action_types.js";
import * as answer from "../service/answer.js";

export function fetchAnswers(auditStoreId){
	return function(dispatch){
		return answer.fetchAnswers(auditStoreId).then((answers) => {
			dispatch({
				type: FETCH_ANSWERS,
				answers,
				auditStoreId,
			});
		});
	};
}

export function setAnswerText(auditStoreId, questionId, answerText, status){
	return function(dispatch){
		return answer.setAnswerText(auditStoreId, questionId, answerText, status).then((answer) => {
			dispatch({
				type: FETCH_ANSWER,
				answer,
				auditStoreId,
				questionId,
			});
		});
	};
}

export function setAnswerComment(auditStoreId, questionId, answerComment){
	return function(dispatch){
		return answer.setAnswerComment(auditStoreId, questionId, answerComment).then((answer) => {
			dispatch({
				type: FETCH_ANSWER,
				answer,
				auditStoreId,
				questionId,
			});
		});
	};
}

