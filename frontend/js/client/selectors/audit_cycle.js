
export default class AuditCycleSelectors {
	constructor(namespace, questionnaireTypeSelectors){
		this.namespace = namespace;
		this.questionnaireTypeSelectors = questionnaireTypeSelectors;
	}

	getNamespacedStore = (store) => store[this.namespace];

	findAuditCycles = (store) => {
		return this.getNamespacedStore(store).auditCycles;
	};

	findSelectedAuditCycle = (store, selectedQuestionnaireTypeId) => {
		return this.findAuditCyclesByQuestionnaireType(store, selectedQuestionnaireTypeId)
			.find(ac => ac.id === this.getNamespacedStore(store).selectedAuditCycleId)
			|| this.findFirstAuditCycleByQuestionnaireType(store, selectedQuestionnaireTypeId);
	};

	findFirstAuditCycle = (store) => {
		return this.getNamespacedStore(store).auditCycles[0];
	};

	findFirstAuditCycleByQuestionnaireType = (store, questionnaireTypeId) => {
		const cycles = this.findAuditCyclesByQuestionnaireType(store, questionnaireTypeId);
		return cycles.length > 0 ? cycles[0] : undefined;
	};

	findAuditCyclesByQuestionnaireType = (store, questionnaireTypeId) => {
		return this.findAuditCycles(store).filter(ac => ac.questionnaire_type.id === questionnaireTypeId);
	};

	findAuditCyclesBySelectedQuestionnaireType = (state) => {
		const selectedQuestionnaireType = this.questionnaireTypeSelectors.findSelectedQuestionnaireType(state);
		if(selectedQuestionnaireType) {
			return this.findAuditCyclesByQuestionnaireType(state, selectedQuestionnaireType.id);
		} else {
			return [];
		}
	};

	findSelectedAuditCycleBySelectedQuestionnaireType = (state) => {
		const selectedQuestionnaireType = this.questionnaireTypeSelectors.findSelectedQuestionnaireType(state);
		return selectedQuestionnaireType && this.findSelectedAuditCycle(state, selectedQuestionnaireType.id);
	};
}
