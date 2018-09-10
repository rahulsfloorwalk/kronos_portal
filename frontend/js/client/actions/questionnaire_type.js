import { FETCH_QUESTIONNAIRE_TYPES, SELECT_QUESTIONNAIRE_TYPE } from "../action_types.js";
import * as questionnaireType from "../service/questionnaire_type.js";

export function fetchQuestionnaireTypes(){
	return function(dispatch){
		return questionnaireType.fetchQuestionnaireTypes().then((questionnaireTypes) => {
			dispatch({
				type: FETCH_QUESTIONNAIRE_TYPES,
				questionnaireTypes,
			});
		});
	};
}

export function selectQuestionnaireType(selectedQuestionnaireTypeId){
	return {
		type: SELECT_QUESTIONNAIRE_TYPE,
		selectedQuestionnaireTypeId,
	};
}

