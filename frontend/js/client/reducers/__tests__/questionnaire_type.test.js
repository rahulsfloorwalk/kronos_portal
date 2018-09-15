import { FETCH_QUESTIONNAIRE_TYPES, SELECT_QUESTIONNAIRE_TYPE } from "../../action_types";
import questionnaireTypeReducer, { QuestionnaireTypeSelectors } from "../questionnaire_type";

const sampleQuestionnaireTypes = [
	{
		id: 1,
		name: "Monty",
		is_default: false,
	},
	{
		id: 2,
		name: "Python",
		is_default: false,
	},
];

describe("questionnaireTypeReducer", () => {

	it("gets the initial state", () => {
		const questionnaireTypes = questionnaireTypeReducer(undefined, {});
		expect(questionnaireTypes).toEqual({
			questionnaireTypes: [],
			selectedQuestionnaireTypeId: null,
		});
	});

	describe(FETCH_QUESTIONNAIRE_TYPES, () => {
		it("sets the questionnaireTypes", () => {
			const questionnaireTypes = questionnaireTypeReducer(undefined, {
				type: FETCH_QUESTIONNAIRE_TYPES,
				questionnaireTypes: sampleQuestionnaireTypes,
			});
			expect(questionnaireTypes.questionnaireTypes).toEqual(sampleQuestionnaireTypes);
		});
	});

	describe(SELECT_QUESTIONNAIRE_TYPE, () => {
		it("sets the selected questionnaireType", () => {
			const questionnaireTypes = questionnaireTypeReducer(undefined, {
				type: SELECT_QUESTIONNAIRE_TYPE,
				selectedQuestionnaireTypeId: 2,
			});
			expect(questionnaireTypes.selectedQuestionnaireTypeId).toEqual(2);
		});
	});
});

const createSampleStore = (namespace, questionnaireTypes, defaultIdx, selectedIdx) => {
	return {
		[namespace]: {
			questionnaireTypes: questionnaireTypes.map((qt, idx) => idx === defaultIdx ? Object.assign({}, qt, {
				is_default: true,
			}) : qt),
			selectedQuestionnaireTypeId: questionnaireTypes[selectedIdx] ? questionnaireTypes[selectedIdx].id : null,
		},
	};
};

describe(QuestionnaireTypeSelectors, () => {
	const namespace = "foobar";

	describe(QuestionnaireTypeSelectors.findQuestionnaireTypes, () => {
		const selectors = new QuestionnaireTypeSelectors(namespace);
		it("should fetch the questionnaire types", () => {
			const sampleStore = createSampleStore(namespace, sampleQuestionnaireTypes, null, null);
			expect(selectors.findQuestionnaireTypes(sampleStore)).toEqual(sampleQuestionnaireTypes);
		});
	});

	describe(QuestionnaireTypeSelectors.findSelectedQuestionnaireType, () => {
		const selectors = new QuestionnaireTypeSelectors(namespace);
		it("should fetch the selected questionnaire type when it is selected", () => {
			const sampleStore = createSampleStore(namespace, sampleQuestionnaireTypes, 1, 0);
			expect(selectors.findSelectedQuestionnaireType(sampleStore).id).toEqual(sampleQuestionnaireTypes[0].id);
		});

		it("should fetch the default questionnaire type when nothing is selected", () => {
			const sampleStore = createSampleStore(namespace, sampleQuestionnaireTypes, 1, null);
			expect(selectors.findSelectedQuestionnaireType(sampleStore).id).toEqual(sampleQuestionnaireTypes[1].id);
		});

		it("should fetch the first questionnaire type when there is no default", () => {
			const sampleStore = createSampleStore(namespace, sampleQuestionnaireTypes, null, null);
			expect(selectors.findSelectedQuestionnaireType(sampleStore).id).toEqual(sampleQuestionnaireTypes[0].id);
		});
	});

	describe(QuestionnaireTypeSelectors.findDefaultQuestionnaireType, () => {
		const selectors = new QuestionnaireTypeSelectors(namespace);
		it("should fetch the default questionnaire type", () => {
			const sampleStore = createSampleStore(namespace, sampleQuestionnaireTypes, 1, null);
			expect(selectors.findDefaultQuestionnaireType(sampleStore).id).toEqual(sampleQuestionnaireTypes[1].id);
		});
	});

	describe(QuestionnaireTypeSelectors.findFirstQuestionnaireType, () => {
		const selectors = new QuestionnaireTypeSelectors(namespace);
		it("should fetch the first questionnaire type", () => {
			const sampleStore = createSampleStore(namespace, sampleQuestionnaireTypes, null, null);
			expect(selectors.findFirstQuestionnaireType(sampleStore).id).toEqual(sampleQuestionnaireTypes[0].id);
		});
	});
});
