import { fetchStoreMarkingTrends, fetchStorePerformance } from "../store.js";
import $ from "jquery";
jest.mock("jquery");

beforeEach(() => {
	$.get = jest.fn();
	$.ajax = jest.fn();
});

describe("fetchStoreMarkingTrends", () => {
	it("performs a GET to the correct URL", () => {
		fetchStoreMarkingTrends(5, 3);
		expect($.get).toBeCalledWith("/client/report/questionnaire_type/3/store/5/marking");
	});
});

describe("fetchStorePerformance", () => {
	it("performs a GET to the correct URL", () => {
		fetchStorePerformance(5, 3);
		expect($.get).toBeCalledWith("/client/report/questionnaire_type/3/store/5/marking_graph");
	});
});
