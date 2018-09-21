import {
	FETCH_REPORTS,
	SELECT_CITY,
	SELECT_STORE_TYPE,
	SELECT_PRIORITY,
	SELECT_START_DATE,
	SELECT_END_DATE,
} from "../../action_types";
import reportBrowserReducer, { ReportBrowserSelectors } from "../report_browser";

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

const createSampleStore = (namespace, selectedCityId, selectedStoreType, selectedStorePriority, selectedStartDate, selectedEndDate, auditCycleId) => {
	return {
		[namespace]: {
			reports: {
				[auditCycleId]: sampleReports,
			},
			selectedCityId,
			selectedStoreType,
			selectedStorePriority,
			selectedStartDate,
			selectedEndDate,
		},
	};
};

describe(ReportBrowserSelectors, () => {
	const namespace = "foobar";

	describe("findReportsByAuditCycleId", () => {
		const selectors = new ReportBrowserSelectors(namespace);
		it("returns reports by audit cycle id", () => {
			const auditCycleId = 5;
			const sampleStore = createSampleStore( namespace, 2, null, null, null, null, auditCycleId);
			expect(selectors.findReportsByAuditCycleId(sampleStore, auditCycleId)).toEqual(sampleReports);
		});
	});

	describe("findSelectedCityId", () => {
		const selectors = new ReportBrowserSelectors(namespace);
		it("gets the selected City ID", () => {
			const sampleStore = createSampleStore( namespace, 2, null, null, null, null);
			expect(selectors.findSelectedCityId(sampleStore)).toEqual(2);
		});
	});

	describe("findCitiesByAuditCycleId", () => {
		const selectors = new ReportBrowserSelectors(namespace);
		it("fetches distinct cities from reports", () => {
			const auditCycleId = 5;
			const sampleStore = createSampleStore( namespace, 2, null, null, null, null, auditCycleId);
			expect(selectors.findCitiesByAuditCycleId(sampleStore, auditCycleId)).toEqual([
				{ id: 1, name: "Nagpur", },
				{ id: 2, name: "Mumbai", },
			]);
		});
	});

	describe("findSelectedStoreType", () => {
		const selectors = new ReportBrowserSelectors(namespace);
		it("gets the selected store type", () => {
			const sampleStore = createSampleStore( namespace, null, "FOO", null, null, null);
			expect(selectors.findSelectedStoreType(sampleStore)).toEqual("FOO");
		});
	});

	describe("findSelectedStorePriority", () => {
		const selectors = new ReportBrowserSelectors(namespace);
		it("gets the selected priority", () => {
			const sampleStore = createSampleStore( namespace, null, null, "HIGH", null, null);
			expect(selectors.findSelectedStorePriority(sampleStore)).toEqual("HIGH");
		});
	});

	describe("findSelectedStartDate", () => {
		const selectors = new ReportBrowserSelectors(namespace);
		it("gets the selected start date", () => {
			const sampleStore = createSampleStore( namespace, null, null, null, "2017-08-01", null);
			expect(selectors.findSelectedStartDate(sampleStore)).toEqual("2017-08-01");
		});
	});

	describe("findSelectedEndDate", () => {
		const selectors = new ReportBrowserSelectors(namespace);
		it("gets the selected end date", () => {
			const sampleStore = createSampleStore( namespace, null, null, null, null, "2017-08-30");
			expect(selectors.findSelectedEndDate(sampleStore)).toEqual("2017-08-30");
		});
	});
});
