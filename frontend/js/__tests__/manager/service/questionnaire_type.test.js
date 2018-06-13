import { fetchQuestionnaireTypes } from "../../../manager/service/questionnaire_type";
import $ from "jquery";

jest.mock("jquery", () => ({
	get: jest.fn(),
}));

describe("fetchQuestionnaireTypes", () => {
	it("performs a GET to the correct URL", () => {
		fetchQuestionnaireTypes(5);
		expect($.get).toBeCalledWith("/manager/client/5/questionnaire_type");
	});
});
