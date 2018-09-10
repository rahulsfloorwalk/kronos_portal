import { fetchQuestionnaireTypes } from "../questionnaire_type.js";
import $ from "jquery";
jest.mock("jquery");

beforeEach(() => {
	$.get = jest.fn();
});

describe("fetchQuestionnaireTypes", () => {
	it("performs a GET to the correct URL", () => {
		fetchQuestionnaireTypes();
		expect($.get).toBeCalledWith("/client/questionnaire_types");
	});
});
