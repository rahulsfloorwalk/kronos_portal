import { FETCH_ANSWERS } from "../action_types.js";
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

