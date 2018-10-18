
import { fetchQuestionnaireTypes, selectQuestionnaireType } from "../questionnaire_type";
import { FETCH_QUESTIONNAIRE_TYPES, SELECT_QUESTIONNAIRE_TYPE, RESET_FILTERS } from "../../action_types.js";
import * as questionnaireType from "../../service/questionnaire_type.js";

jest.mock("../../service/questionnaire_type.js");

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

describe(fetchQuestionnaireTypes, () => {
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
	it("it dispatches an action to select the given questionnaire type", () => {
		const questionnaireTypeId = 5;
		const dispatch = jest.fn();
		const thunk = selectQuestionnaireType(questionnaireTypeId);

		thunk(dispatch);
		expect(dispatch).toBeCalledWith({
			type: SELECT_QUESTIONNAIRE_TYPE,
			selectedQuestionnaireTypeId: questionnaireTypeId,
		});
	});

	it("it dispatches an action to reset the filters", () => {
		const questionnaireTypeId = 5;
		const dispatch = jest.fn();
		const thunk = selectQuestionnaireType(questionnaireTypeId);

		thunk(dispatch);
		expect(dispatch).lastCalledWith({
			type: RESET_FILTERS,
		});
	});
});

