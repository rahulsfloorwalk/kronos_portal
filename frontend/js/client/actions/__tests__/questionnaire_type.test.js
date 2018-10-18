
import { fetchQuestionnaireTypes, selectQuestionnaireType } from "../questionnaire_type";
import { FETCH_QUESTIONNAIRE_TYPES, SELECT_QUESTIONNAIRE_TYPE } from "../../action_types.js";
import * as questionnaireType from "../../service/questionnaire_type.js";

jest.mock("../../service/questionnaire_type.js");

describe(fetchQuestionnaireTypes, () => {
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

	it("it calls fetchQuestionnaireTypes on the questionnaireType service", () => {
		questionnaireType.fetchQuestionnaireTypes.mockResolvedValue(sampleQuestionnaireTypes);
		const dispatch = jest.fn();
		const thunk = fetchQuestionnaireTypes();

		thunk(dispatch);
		expect(questionnaireType.fetchQuestionnaireTypes).toHaveBeenCalled();
	});

	it("it dispatches an action when the request is successful", (done) => {
		questionnaireType.fetchQuestionnaireTypes.mockResolvedValue(sampleQuestionnaireTypes);
		const dispatch = jest.fn();
		const thunk = fetchQuestionnaireTypes();

		thunk(dispatch);
		setTimeout(() => {
			expect(dispatch).toBeCalledWith({
				type: FETCH_QUESTIONNAIRE_TYPES,
				questionnaireTypes: sampleQuestionnaireTypes,
			});
			done();
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
