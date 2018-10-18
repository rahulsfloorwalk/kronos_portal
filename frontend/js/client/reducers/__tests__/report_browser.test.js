import {
	FETCH_REPORTS,
	SELECT_CITY,
	SELECT_STORE_TYPE,
	SELECT_PRIORITY,
	SELECT_START_DATE,
	SELECT_END_DATE,
	RESET_FILTERS,
} from "../../action_types";
import reportBrowserReducer from "../report_browser";
import {
	selectCity,
	selectStoreType,
	selectPriority,
	selectStartDate,
	selectEndDate,
	resetDependentFilters,
} from "../report_browser";

const sampleReports = [
	{
		id: 1,
		audit_date: "2018-08-30",
		city_id: 1,
		city_name: "Nagpur",
		store_type: "Express",
		store_priority: "HIGH",
	},
	{
		id: 2,
		audit_date: "2018-08-26",
		city_id: 2,
		city_name: "Mumbai",
		store_type: "Slowmo",
		store_priority: "MEDIUM",
	},
	{
		id: 3,
		audit_date: "2018-08-28",
		city_id: 2,
		city_name: "Mumbai",
		store_type: "Slowmo",
		store_priority: "MEDIUM",
	},
];

describe("reportBrowserReducer", () => {

	it("gets the initial state", () => {
		const reportBrowserState = reportBrowserReducer(undefined, {});
		expect(reportBrowserState).toEqual({
			reports: {},
			selectedCityId: null,
			selectedStoreType: null,
			selectedStorePriority: null,
			selectedEndDate: null,
			selectedStartDate: null,
		});
	});

	describe(FETCH_REPORTS, () => {
		it("sets the fetched reports at the audit cycle based key", () => {
			const state = reportBrowserReducer(undefined, {
				type: FETCH_REPORTS,
				reports: sampleReports,
				auditCycleId: 2,
			});
			expect(state.reports[2]).toEqual(sampleReports);
		});
	});

	describe(SELECT_CITY, () => {
		it("sets the selected city", () => {
			const reports = reportBrowserReducer(undefined, {
				type: SELECT_CITY,
				selectedCityId: 2,
			});
			expect(reports.selectedCityId).toEqual(2);
		});
	});

	describe(SELECT_STORE_TYPE, () => {
		it("sets the selected store type", () => {
			const reports = reportBrowserReducer(undefined, {
				type: SELECT_STORE_TYPE,
				selectedStoreType: "FOO",
			});
			expect(reports.selectedStoreType).toEqual("FOO");
		});
	});

	describe(SELECT_PRIORITY, () => {
		it("sets the selected priority", () => {
			const reports = reportBrowserReducer(undefined, {
				type: SELECT_PRIORITY,
				selectedStorePriority: "HIGH",
			});
			expect(reports.selectedPriority).toEqual("HIGH");
		});
	});

	describe(SELECT_START_DATE, () => {
		it("sets the selected start date", () => {
			const reports = reportBrowserReducer(undefined, {
				type: SELECT_START_DATE,
				selectedStartDate: "2018-07-01",
			});
			expect(reports.selectedStartDate).toEqual("2018-07-01");
		});
	});

	describe(SELECT_END_DATE, () => {
		it("sets the selected end date", () => {
			const reports = reportBrowserReducer(undefined, {
				type: SELECT_END_DATE,
				selectedEndDate: "2018-07-30",
			});
			expect(reports.selectedEndDate).toEqual("2018-07-30");
		});
	});
});

describe(resetDependentFilters, () => {
	it("returns an action to reset the dependent filters", () => {
		const cityId = 5;
		const action = resetDependentFilters();

		expect(action).toEqual({
			type: RESET_FILTERS,
		});
	});
});

describe(selectCity, () => {
	it("returns an action to select the city", () => {
		const cityId = 5;
		const action = selectCity(cityId);

		expect(action).toEqual({
			type: SELECT_CITY,
			selectedCityId: cityId,
		});
	});
});

describe(selectStoreType, () => {
	it("returns an action to select the store type", () => {
		const storeType = "FOO";
		const action = selectStoreType(storeType);

		expect(action).toEqual({
			type: SELECT_STORE_TYPE,
			selectedStoreType: storeType,
		});
	});
});

describe(selectPriority, () => {
	it("returns an action to select the priority", () => {
		const priority = "HIGH";
		const action = selectPriority(priority);

		expect(action).toEqual({
			type: SELECT_PRIORITY,
			selectedPriority: priority,
		});
	});
});

describe(selectStartDate, () => {
	it("returns an action to select the start date", () => {
		const startDate = "2017-08-01";
		const action = selectStartDate(startDate);

		expect(action).toEqual({
			type: SELECT_START_DATE,
			selectedStartDate: startDate,
		});
	});
});

describe(selectEndDate, () => {
	it("returns an action to select the end date", () => {
		const endDate = "2017-08-30";
		const action = selectEndDate(endDate);

		expect(action).toEqual({
			type: SELECT_END_DATE,
			selectedEndDate: endDate,
		});
	});
});
