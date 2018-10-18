import { FETCH_QUESTIONNAIRE_TYPES, SELECT_QUESTIONNAIRE_TYPE } from "../action_types.js";

const initialState = {
	questionnaireTypes: [],
	selectedQuestionnaireTypeId: null,
};

export default (state=initialState, action) => {
	switch(action.type){
	case FETCH_QUESTIONNAIRE_TYPES:
		return Object.assign({}, state, {
			questionnaireTypes: action.questionnaireTypes,
		});
	case SELECT_QUESTIONNAIRE_TYPE:
		return Object.assign({}, state, {
			selectedQuestionnaireTypeId: action.selectedQuestionnaireTypeId,
		});
	default:
		return state;
	}
};

