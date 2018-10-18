import {
	SELECT_CITY,
	SELECT_STORE_TYPE,
	SELECT_PRIORITY,
	SELECT_START_DATE,
	SELECT_END_DATE,
	FETCH_REPORTS,
} from "../../action_types";

import {
	selectCity,
	selectStoreType,
	selectPriority,
	selectStartDate,
	selectEndDate,
	fetchReportsByAuditCycleId,
} from "../report_browser";

import { findAuditStoresByAuditCycle } from "../../service/audit_store";
jest.mock("../../service/audit_store");

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
];

describe(fetchReportsByAuditCycleId, () => {
	it("calls findAuditStoresByAuditCycle", () => {
		findAuditStoresByAuditCycle.mockResolvedValue(sampleReports);
		const auditCycleId = 5;
		const dispatch = jest.fn();
		const thunk = fetchReportsByAuditCycleId(auditCycleId);

		thunk(dispatch);
		expect(findAuditStoresByAuditCycle).toHaveBeenCalledWith(auditCycleId);
	});

	it("dispatches an action when the request is successful", (done) => {
		findAuditStoresByAuditCycle.mockResolvedValue(sampleReports);
		const auditCycleId = 5;
		const dispatch = jest.fn();
		const thunk = fetchReportsByAuditCycleId(auditCycleId);

		thunk(dispatch);
		setTimeout(() => {
			expect(dispatch).toBeCalledWith({
				type: FETCH_REPORTS,
				reports: sampleReports,
				auditCycleId,
			});
			done();
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
