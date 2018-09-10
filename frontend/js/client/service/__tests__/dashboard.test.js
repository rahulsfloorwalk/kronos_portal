import { fetchCityWisePerformance, fetchStoreWisePerformance, fetchAuditCyclesTimeSeries } from "../dashboard.js";
import $ from "jquery";
jest.mock("jquery");

beforeEach(() => {
	$.get = jest.fn();
	$.ajax = jest.fn();
});

describe("fetchCityWisePerformance", () => {
	it("performs a GET to the correct URL", () => {
		fetchCityWisePerformance(5);
		expect($.get).toBeCalledWith("/client/dashboard/questionnaire_type/5/city_trends");
	});
});

describe("fetchStoreWisePerformance", () => {
	it("performs a GET to the correct URL", () => {
		fetchStoreWisePerformance(5);
		expect($.get).toBeCalledWith("/client/dashboard/questionnaire_type/5/store_trends");
	});
});

describe("fetchAuditCyclesTimeSeries", () => {
	it("performs a GET to the correct URL", () => {
		fetchAuditCyclesTimeSeries(5);
		expect($.get).toBeCalledWith("/client/dashboard/questionnaire_type/5/time_series");
	});
});

