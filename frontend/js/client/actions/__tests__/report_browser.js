import {
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

