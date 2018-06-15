import { fetchQuestionnaireTypes, createQuestionnaireType, saveQuestionnaireType } from "../questionnaire_type";

import $ from "jquery";
jest.mock("jquery");

beforeEach(() => {
	$.get = jest.fn();
	$.ajax = jest.fn();
});

const sampleQuestionnaireType = {
	id: 5,
	name: "Foobar",
	is_default: true,
	client_id: 7,
};

describe("fetchQuestionnaireTypes", () => {
	it("performs a GET to the correct URL", () => {
		fetchQuestionnaireTypes(5);
		expect($.get).toBeCalledWith("/manager/client/5/questionnaire_type");
	});
});

describe("createQuestionnaireType", () => {
	it("performs a POST to the correct URL", () => {
		createQuestionnaireType(
			sampleQuestionnaireType.name,
			sampleQuestionnaireType.client_id,
			sampleQuestionnaireType.is_default,
		)
		expect($.ajax.mock.calls[0][0].method).toEqual("POST");
		expect($.ajax.mock.calls[0][0].contentType).toEqual("application/json");
		expect($.ajax.mock.calls[0][0].url).toEqual("/manager/questionnaire_type");
		expect($.ajax.mock.calls[0][0].data).toEqual(JSON.stringify({
			name: sampleQuestionnaireType.name,
			is_default: sampleQuestionnaireType.is_default,
			client: sampleQuestionnaireType.client_id,
		}));
	});
});

describe("saveQuestionnaireType", () => {
	it("performs a POST to the correct URL", () => {
		saveQuestionnaireType(
			sampleQuestionnaireType.id,
			sampleQuestionnaireType.name,
			sampleQuestionnaireType.client_id,
			sampleQuestionnaireType.is_default,
		)
		expect($.ajax.mock.calls[0][0].method).toEqual("POST");
		expect($.ajax.mock.calls[0][0].contentType).toEqual("application/json");
		expect($.ajax.mock.calls[0][0].url).toEqual("/manager/questionnaire_type/" + sampleQuestionnaireType.id);
		expect($.ajax.mock.calls[0][0].data).toEqual(JSON.stringify({
			name: sampleQuestionnaireType.name,
			is_default: sampleQuestionnaireType.is_default,
			client: sampleQuestionnaireType.client_id,
		}));
	});
});
