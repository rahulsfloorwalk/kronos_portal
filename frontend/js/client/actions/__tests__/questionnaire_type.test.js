
import { fetchQuestionnaireTypes } from "../questionnaire_type";
import { FETCH_QUESTIONNAIRE_TYPES } from "../../action_types.js";
import * as questionnaireType from "../../service/questionnaire_type.js";

jest.mock("../../service/questionnaire_type.js");

describe("fetchQuestionnaireTypes", () => {
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

	it("it dispatches an action when the request is successful", (done) => {
		questionnaireType.fetchQuestionnaireTypes.mockResolvedValue(sampleQuestionnaireTypes);
		const dispatch = jest.fn();
		const thunk = fetchQuestionnaireTypes();

		thunk(dispatch);
		expect(questionnaireType.fetchQuestionnaireTypes).toHaveBeenCalled();
		setTimeout(() => {
			expect(dispatch).toBeCalledWith({
				type: FETCH_QUESTIONNAIRE_TYPES,
				questionnaireTypes: sampleQuestionnaireTypes,
			});
			done();
		});
	});
});
