
import ReportBrowserSelectors from "../report_browser";

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
	{
		id: 4,
		audit_date: "2018-08-28",
		city_id: 2,
		city_name: "Mumbai",
		store_type: "",
		store_priority: "",
	},
	{
		id: 5,
		audit_date: "2018-08-29",
		city_id: 2,
		city_name: "Mumbai",
		store_type: "",
		store_priority: "",
	},
];


const createSampleStore = (namespace, selectedCityId, selectedStoreType, selectedStorePriority, selectedStartDate, selectedEndDate, auditCycleId, selectedOptionIds) => {
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
			selectedOptionIds,
		},
	};
};

describe("ReportBrowserSelectors", () => {
	const namespace = "foobar";
	let auditCycleSelectors;
	let selectors;

	beforeEach(() => {
		auditCycleSelectors = {
			findSelectedAuditCycleBySelectedQuestionnaireType: jest.fn(),
		};
		selectors = new ReportBrowserSelectors(namespace, auditCycleSelectors);
	});

	describe("findReportsByAuditCycleId", () => {
		it("returns reports by audit cycle id", () => {
			const auditCycleId = 5;
			const sampleStore = createSampleStore( namespace, 2, null, null, null, null, auditCycleId);
			expect(selectors.findReportsByAuditCycleId(sampleStore, auditCycleId)).toEqual(sampleReports);
		});
	});

	describe("findSelectedCityId", () => {
		it("gets the selected City ID", () => {
			const sampleStore = createSampleStore( namespace, 2, null, null, null, null);
			expect(selectors.findSelectedCityId(sampleStore)).toEqual(2);
		});
	});

	describe("findCitiesByAuditCycleId", () => {
		it("fetches distinct cities for the given audit cycle id", () => {
			const auditCycleId = 5;
			const sampleStore = createSampleStore( namespace, 2, null, null, null, null, auditCycleId);
			expect(selectors.findCitiesByAuditCycleId(sampleStore, auditCycleId)).toEqual([
				{ id: 1, name: "Nagpur", },
				{ id: 2, name: "Mumbai", },
			]);
		});
	});

	describe("findStoreTypesByAuditCycleId", () => {
		it("returns distinct store types for the given audit cycle id", () => {
			const auditCycleId = 5;
			const sampleStore = createSampleStore( namespace, 2, null, null, null, null, auditCycleId);
			expect(selectors.findStoreTypesByAuditCycleId(sampleStore, auditCycleId)).toEqual([
				"Express", "Slowmo",
			]);
		});
	});

	describe("findStorePrioritiesByAuditCycleId", () => {
		it("returns distinct store priorities for the given audit cycle id", () => {
			const auditCycleId = 5;
			const sampleStore = createSampleStore( namespace, 2, null, null, null, null, auditCycleId);
			expect(selectors.findStorePrioritiesByAuditCycleId(sampleStore, auditCycleId)).toEqual([
				"HIGH", "MEDIUM",
			]);
		});
	});

	describe("findSelectedStoreType", () => {
		it("gets the selected store type", () => {
			const sampleStore = createSampleStore( namespace, null, "FOO", null, null, null);
			expect(selectors.findSelectedStoreType(sampleStore)).toEqual("FOO");
		});
	});

	describe("findSelectedStorePriority", () => {
		it("gets the selected priority", () => {
			const sampleStore = createSampleStore( namespace, null, null, "HIGH", null, null);
			expect(selectors.findSelectedStorePriority(sampleStore)).toEqual("HIGH");
		});
	});

	describe("findSelectedStartDate", () => {
		it("gets the selected start date", () => {
			const sampleStore = createSampleStore( namespace, null, null, null, "2017-08-01", null);
			expect(selectors.findSelectedStartDate(sampleStore)).toEqual("2017-08-01");
		});
	});

	describe("findSelectedEndDate", () => {
		it("gets the selected end date", () => {
			const sampleStore = createSampleStore( namespace, null, null, null, null, "2017-08-30");
			expect(selectors.findSelectedEndDate(sampleStore)).toEqual("2017-08-30");
		});
	});

	describe("findSelectedOptionIdByJsonId", () => {
		it("returns the selected option id for the given json ID", () => {
			const sampleJsonId = "FOOBAR";
			const sampleOptionId = "OPT1";
			const sampleStore = createSampleStore( namespace, null, null, null, null, null, null, {
				[sampleJsonId]: sampleOptionId,
			});
			expect(selectors.findSelectedOptionIdByJsonId(sampleStore, sampleJsonId)).toEqual(sampleOptionId);
		});

		it("should return undefined if there are no selected option for given json id", () => {
			const sampleStore = createSampleStore( namespace, null, null, null, null, null, null, {});
			expect(selectors.findSelectedOptionIdByJsonId(sampleStore, "3465dsf345")).toBeUndefined();
		});
	});

	describe("findReportAttributeSelectedOptionIds", () => {
		it("returns all selected options for for report attributes", () => {
			const sampleJsonId = "FOOBAR1";
			const sampleOptionId = "OPT1";
			const sampleJsonId2 = "FOOBAR2";
			const sampleOptionId2 = "OPT2";
			const sampleStore = createSampleStore( namespace, null, null, null, null, null, null, {
				[sampleJsonId]: sampleOptionId,
				[sampleJsonId2]: sampleOptionId2,
			});
			const expectedValue = {"FOOBAR1": "OPT1", "FOOBAR2": "OPT2"};
			expect(selectors.findReportAttributeSelectedOptionIds(sampleStore)).toEqual(expectedValue);
		});

		it("returns empty object when no option is selected", () => {
			const sampleJsonId = "FOOBAR1";
			const sampleOptionId = undefined;
			const sampleStore = createSampleStore( namespace, null, null, null, null, null, null, {
				[sampleJsonId]: sampleOptionId,
			});
			const expectedValue = {};
			expect(selectors.findReportAttributeSelectedOptionIds(sampleStore)).toEqual(expectedValue);
		});
	});

	describe("findCitiesBySelectedAuditCycle", () => {
		it("returns distinct cities for the selected audit cycle", () => {
			const auditCycleId = 5;
			auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType.mockReturnValue({ id: auditCycleId });
			const sampleStore = createSampleStore( namespace, 2, null, null, null, null, auditCycleId);
			expect(selectors.findCitiesBySelectedAuditCycle(sampleStore)).toEqual([
				{ id: 1, name: "Nagpur", },
				{ id: 2, name: "Mumbai", },
			]);
		});
	});

	describe("findStoreTypesBySelectedAuditCycle", () => {
		it("returns distinct store types for the selected audit cycle", () => {
			const auditCycleId = 5;
			auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType.mockReturnValue({ id: auditCycleId });
			const sampleStore = createSampleStore( namespace, 2, null, null, null, null, auditCycleId);
			expect(selectors.findStoreTypesBySelectedAuditCycle(sampleStore)).toEqual([
				"Express", "Slowmo",
			]);
		});
	});

	describe("findStorePrioritiesBySelectedAuditCycle", () => {
		it("returns distinct store priorities for the selected audit cycle", () => {
			const auditCycleId = 5;
			auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType.mockReturnValue({ id: auditCycleId });
			const sampleStore = createSampleStore( namespace, 2, null, null, null, null, auditCycleId);
			expect(selectors.findStorePrioritiesBySelectedAuditCycle(sampleStore)).toEqual([
				"HIGH", "MEDIUM",
			]);
		});
	});

	describe("findSelectedStartDateBySelectedAuditCycle", () => {
		it("returns the selected start date", () => {
			const auditCycleId = 5;
			auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType.mockReturnValue({ id: auditCycleId });
			const startDate = "2018-07-01";
			const sampleStore = createSampleStore( namespace, 2, null, null, startDate, null, auditCycleId);
			expect(selectors.findSelectedStartDateBySelectedAuditCycle(sampleStore)).toEqual(startDate);
		});

		it("returns the start date for the selected audit cycle if no start date is selected", () => {
			const auditCycle = {
				id: 5,
				start_date: "2018-07-01",
			};
			auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType.mockReturnValue(auditCycle);
			const sampleStore = createSampleStore( namespace, 2, null, null, null, null, auditCycle.id);
			expect(selectors.findSelectedStartDateBySelectedAuditCycle(sampleStore)).toEqual(auditCycle.start_date);
		});
	});

	describe("findSelectedEndDateBySelectedAuditCycle", () => {
		it("returns the selected end date", () => {
			const auditCycleId = 5;
			auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType.mockReturnValue({ id: auditCycleId });
			const endDate = "2018-07-30";
			const sampleStore = createSampleStore( namespace, 2, null, null, null, endDate, auditCycleId);
			expect(selectors.findSelectedEndDateBySelectedAuditCycle(sampleStore)).toEqual(endDate);
		});

		it("returns the end date for the selected audit cycle if no end date is selected", () => {
			const auditCycle = {
				id: 5,
				end_date: "2018-07-30",
			};
			auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType.mockReturnValue(auditCycle);
			const sampleStore = createSampleStore( namespace, 2, null, null, null, null, auditCycle.id);
			expect(selectors.findSelectedEndDateBySelectedAuditCycle(sampleStore)).toEqual(auditCycle.end_date);
		});
	});

	describe("findMinimumStartDateBySelectedAuditCycle", () => {});
	describe("findMaximumStartDateBySelectedAuditCycle", () => {});

	describe("findMinimumEndDateBySelectedAuditCycle", () => {});
	describe("findMaximumEndDateBySelectedAuditCycle", () => {});

	describe("findStartDateBySelectedAuditCycle", () => {
		it("returns the start date for the selected audit cycle", () => {
			const auditCycle = {
				id: 5,
				start_date: "2018-07-01",
			};
			auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType.mockReturnValue(auditCycle);
			const sampleStore = createSampleStore( namespace, 2, null, null, null, null, auditCycle.id);
			expect(selectors.findStartDateBySelectedAuditCycle(sampleStore)).toEqual(auditCycle.start_date);
		});

		it("returns falsy if no audit cycle is selected", () => {
			auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType.mockReturnValue(undefined);
			const sampleStore = createSampleStore( namespace, 2, null, null, null, null, null);
			expect(selectors.findStartDateBySelectedAuditCycle(sampleStore)).toBeFalsy();
		});
	});

	describe("findEndDateBySelectedAuditCycle", () => {
		it("returns the end date for the selected audit cycle", () => {
			const auditCycle = {
				id: 5,
				end_date: "2018-07-30",
			};
			auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType.mockReturnValue(auditCycle);
			const sampleStore = createSampleStore( namespace, 2, null, null, null, null, auditCycle.id);
			expect(selectors.findEndDateBySelectedAuditCycle(sampleStore)).toEqual(auditCycle.end_date);
		});

		it("returns falsy if no audit cycle is selected", () => {
			auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType.mockReturnValue(undefined);
			const sampleStore = createSampleStore( namespace, 2, null, null, null, null, null);
			expect(selectors.findEndDateBySelectedAuditCycle(sampleStore)).toBeFalsy();
		});
	});

	describe("filterReports", () => {
		it("returns the filtered reports when all filters are set", () => {
			const auditCycle = {
				id: 5,
				start_date: "2018-08-01",
				end_date: "2018-08-30",
			};
			auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType.mockReturnValue(auditCycle);
			const sampleStore = createSampleStore( namespace, 2, "Slowmo", "MEDIUM", "2018-08-20", "2018-08-27", auditCycle.id);
			expect(selectors.filterReports(sampleStore)).toEqual([sampleReports[1]]);
		});

		it("returns the filtered reports when no filters are set", () => {
			const auditCycle = {
				id: 5,
				start_date: "2018-08-01",
				end_date: "2018-08-30",
			};
			auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType.mockReturnValue(auditCycle);
			const sampleStore = createSampleStore( namespace, null, null, null, null, null, auditCycle.id);
			expect(selectors.filterReports(sampleStore)).toEqual(sampleReports);
		});

		it("returns an empty array when no audit cycle is selected", () => {
			auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType.mockReturnValue(undefined);
			const sampleStore = createSampleStore( namespace, null, null, null, null, null, null);
			expect(selectors.filterReports(sampleStore)).toEqual([]);
		});
	});
});
