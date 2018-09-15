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

export class QuestionnaireTypeSelectors {
	constructor(namespace){
		this.namespace = namespace;
	}

	getNamespacedStore = (store) => store[this.namespace];

	findQuestionnaireTypes = (store) => {
		return this.getNamespacedStore(store).questionnaireTypes;
	};

	findSelectedQuestionnaireType = (store) => {
		return this.getNamespacedStore(store)
			.questionnaireTypes
			.find(qt => qt.id === this.getNamespacedStore(store).selectedQuestionnaireTypeId)
			|| this.findDefaultQuestionnaireType(store)
			|| this.findFirstQuestionnaireType(store);
	};

	findDefaultQuestionnaireType = (store) => {
		return this.getNamespacedStore(store).questionnaireTypes.find(qt => qt.is_default);
	};

	findFirstQuestionnaireType = (store) => {
		return this.getNamespacedStore(store).questionnaireTypes[0];
	};
}
