
export default class QuestionnaireTypeSelectors {
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
