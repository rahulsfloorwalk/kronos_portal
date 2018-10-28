import { fetchAuditCycles, selectAuditCycle } from "../audit_cycle";
import { FETCH_AUDIT_CYCLES, SELECT_AUDIT_CYCLE, RESET_FILTERS } from "../../action_types.js";
import * as auditCycleService from "../../service/audit_cycle";
import {fetchReportAttributesByAuditCycleId} from "../report_attribute";
jest.mock("../report_attribute");
jest.mock("../../service/audit_cycle");

const sampleAuditCycles = [
	{
		id: 1,
		name: "Desert Eagle",
	},
	{
		id: 2,
		name: "Kalashnikov",
	},
];

describe(fetchAuditCycles, () => {
	it("it calls fetchAuditCycles on the auditCycleService", () => {
		auditCycleService.fetchAuditCycles.mockResolvedValue(sampleAuditCycles);
		const dispatch = jest.fn();
		const thunk = fetchAuditCycles();

		thunk(dispatch);
		expect(auditCycleService.fetchAuditCycles).toHaveBeenCalled();
	});

	it("it dispatches an action when the request is successful", (done) => {
		auditCycleService.fetchAuditCycles.mockResolvedValue(sampleAuditCycles);
		const dispatch = jest.fn();
		const thunk = fetchAuditCycles();

		thunk(dispatch);
		setTimeout(() => {
			expect(dispatch).toBeCalledWith({
				type: FETCH_AUDIT_CYCLES,
				auditCycles: sampleAuditCycles,
			});
			done();
		});
	});
});

describe("selectAuditCycle", () => {
	it("it dispatches an action to select the given audit cycle", () => {
		const auditCycleId = 5;
		const dispatch = jest.fn();
		const thunk = selectAuditCycle(auditCycleId);

		thunk(dispatch);
		expect(dispatch).toBeCalledWith({
			type: SELECT_AUDIT_CYCLE,
			selectedAuditCycleId: auditCycleId,
		});
	});

	it("it dispatches an action to reset the filters", () => {
		const auditCycleId = 5;
		const dispatch = jest.fn();
		const thunk = selectAuditCycle(auditCycleId);

		thunk(dispatch);
		expect(dispatch).toBeCalledWith({
			type: RESET_FILTERS,
		});
	});

	it("it dispatches an action to fetch report attributes by audit cycle id", () => {
		const expectedThunk = "foobar";
		fetchReportAttributesByAuditCycleId.mockReturnValue(expectedThunk);
		const auditCycleId = 5;
		const dispatch = jest.fn();
		const thunk = selectAuditCycle(auditCycleId);

		thunk(dispatch);
		expect(dispatch).lastCalledWith(expectedThunk);
		expect(fetchReportAttributesByAuditCycleId).toBeCalledWith(auditCycleId);
	});
});

