import { FETCH_QUESTIONNAIRE_TYPES, SELECT_QUESTIONNAIRE_TYPE } from "../../action_types";
import questionnaireTypeReducer, { QuestionnaireTypeSelectors } from "../questionnaire_type";

describe("questionnaireTypeReducer", () => {
	const sampleQuestionnaireTypes = [
		{
			id: 1,
			name: "Monty",
		},
		{
			id: 2,
			name: "Python",
		},
	];

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

describe(QuestionnaireTypeSelectors, () => {
	const namespace = "questionnaireType";
	const sampleQuestionnaireTypes = [
		{
			id: 1,
			name: "Monty",
			is_default: false,
		},
		{
			id: 2,
			name: "Python",
			is_default: true,
		},
	];

	const selectedQuestionnaireTypeId = 1;

	const sampleStore = {
		questionnaireType: {
			questionnaireTypes: sampleQuestionnaireTypes,
			selectedQuestionnaireTypeId,
		},
	};

	describe("findQuestionnaireTypes", () => {
		const selectors = new QuestionnaireTypeSelectors(namespace);
		it("should fetch the questionnaire types", () => {
			expect(selectors.findQuestionnaireTypes(sampleStore)).toEqual(sampleQuestionnaireTypes);
		});
	});

	describe("findSelectedQuestionnaireTypeId", () => {
		const selectors = new QuestionnaireTypeSelectors(namespace);
		it("should fetch the selected questionnaireType id", () => {
			expect(selectors.findSelectedQuestionnaireTypeId(sampleStore)).toEqual(selectedQuestionnaireTypeId);
		});
	});

	describe("findSelectedQuestionnaireType", () => {
		const selectors = new QuestionnaireTypeSelectors(namespace);
		it("should fetch the selected questionnaire type", () => {
			expect(selectors.findSelectedQuestionnaireType(sampleStore)).toEqual(sampleQuestionnaireTypes[0]);
		});
	});

	describe("findDefaultQuestionnaireType", () => {
		const selectors = new QuestionnaireTypeSelectors(namespace);
		it("should fetch the default questionnaire type", () => {
			expect(selectors.findDefaultQuestionnaireType(sampleStore)).toEqual(sampleQuestionnaireTypes[1]);
		});
	});

	describe("findFirstQuesionnaireType", () => {
		const selectors = new QuestionnaireTypeSelectors(namespace);
		it("should fetch the first questionnaire type", () => {
			expect(selectors.findFirstQuesionnaireType(sampleStore)).toEqual(sampleQuestionnaireTypes[0]);
		});
	});
});
