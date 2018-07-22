import { FETCH_ANSWERS, FETCH_ANSWER } from "../action_types.js";

export default (answers=[], action) => {
	switch(action.type){
	case FETCH_ANSWERS:
		return action.answers;
	case FETCH_ANSWER: {
		const idx = answers.findIndex((a) => a.id === action.answer.id);
		if(idx < 0){
			return [...answers, action.answer];
		} else {
			return Object.assign([], answers, { [idx]: action.answer });
		}
	}
	default:
		return answers;
	}
};

export const findAnswer = (store, auditStoreId, questionId) => {
	return store.answers.find((a) => a.audit_store_id === auditStoreId && a.question_id === questionId);
};
