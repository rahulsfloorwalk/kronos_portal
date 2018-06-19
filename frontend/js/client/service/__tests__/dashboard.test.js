import { fetchQuestionnaireTypes } from "../dashboard.js";
import $ from "jquery";
jest.mock("jquery");

beforeEach(() => {
	$.get = jest.fn();
	$.ajax = jest.fn();
});

describe("fetchQuestionnaireTypes", () => {
	it("performs a GET to the correct URL", () => {
		fetchQuestionnaireTypes();
		expect($.get).toBeCalledWith("/client/questionnaire_types");
	});
});

