import { FETCH_QUESTIONNAIRE_TYPES } from "../../action_types";
import questionnaireTypeReducer from "../questionnaire_type";

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
	it("sets the questionnaireTypes", () => {
		const questionnaireTypes = questionnaireTypeReducer(undefined, {
			type: FETCH_QUESTIONNAIRE_TYPES,
			questionnaireTypes: sampleQuestionnaireTypes,
		});
	 	expect(questionnaireTypes).toEqual(sampleQuestionnaireTypes);
	});
});
