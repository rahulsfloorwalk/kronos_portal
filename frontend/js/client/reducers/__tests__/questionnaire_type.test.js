import { FETCH_QUESTIONNAIRE_TYPES, SELECT_QUESTIONNAIRE_TYPE } from "../../action_types";
import questionnaireTypeReducer from "../questionnaire_type";
import { selectQuestionnaireType, fetchQuestionnaireTypes } from "../questionnaire_type";

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

describe(selectQuestionnaireType, () => {
	it("it dispatches an action to set the selected questionnaire type", () => {
		const questionnaireTypeId = 5;
		const action = selectQuestionnaireType(questionnaireTypeId);

		expect(action).toEqual({
			type: SELECT_QUESTIONNAIRE_TYPE,
			selectedQuestionnaireTypeId: questionnaireTypeId,
		});
	});
});

describe(fetchQuestionnaireTypes, () => {
	it("it dispatches an action to fetch questionnaire types", () => {
		const action = fetchQuestionnaireTypes(sampleQuestionnaireTypes);

		expect(action).toEqual({
			type: FETCH_QUESTIONNAIRE_TYPES,
			questionnaireTypes: sampleQuestionnaireTypes,
		});
	});
});
