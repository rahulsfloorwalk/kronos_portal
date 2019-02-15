import { fetchModeratorSummaryByAuditCycle, fetchModerators } from "../moderator";
import { findModeratorSummaryByAuditCycle, findModerators } from "../../service/moderator";
import types from "../../../manager/action_types";

jest.mock("../../service/moderator");

describe(fetchModeratorSummaryByAuditCycle, () => {
	const sampleSummary = {
		1: {
			"ASSIGNED": 3,
		},
	};
	const sampleAuditCycleId = 5;

	beforeEach(() => {
		findModeratorSummaryByAuditCycle.mockResolvedValue(sampleSummary);
	});

	it("it dispatches a request to get the moderator summary for given audit cycle id", (done) => {
		const dispatch = jest.fn();
		const thunk = fetchModeratorSummaryByAuditCycle(sampleAuditCycleId);
		thunk(dispatch);
		setTimeout(() => {
			expect(dispatch).toBeCalledWith({
				type: types.AUDIT_CYCLE_MODERATOR_SUMMARY,
				auditCycleId: sampleAuditCycleId,
				moderatorSummary: sampleSummary,
			});
			done();
		});
	});

	it("it returns a promise which resolves to the summary for given audit cycle id", () => {
		const dispatch = jest.fn();
		const thunk = fetchModeratorSummaryByAuditCycle(sampleAuditCycleId);
		return expect(thunk(dispatch)).resolves.toEqual(sampleSummary);
	});

	it("it calls the service to find the summary for given audit cycle id", () => {
		const dispatch = jest.fn();
		const thunk = fetchModeratorSummaryByAuditCycle(sampleAuditCycleId);
		thunk(dispatch);
		expect(findModeratorSummaryByAuditCycle).toBeCalledWith(sampleAuditCycleId);
	});
});

describe(fetchModerators, () => {
	const sampleModerators = [
		{
			"id": 1,
			"email": "foo@bar.com",
		},
	];

	beforeEach(() => {
		findModerators.mockResolvedValue(sampleModerators);
	});

	it("it dispatches a request to get the moderators", (done) => {
		const dispatch = jest.fn();
		const thunk = fetchModerators();
		thunk(dispatch);
		setTimeout(() => {
			expect(dispatch).toBeCalledWith({
				type: types.MODERATOR_GET,
				moderators: sampleModerators,
			});
			done();
		});
	});

	it("it returns a promise which resolves to the list of moderators", () => {
		const dispatch = jest.fn();
		const thunk = fetchModerators();
		return expect(thunk(dispatch)).resolves.toEqual(sampleModerators);
	});

	it("it calls the service to find the list of moderators", () => {
		const dispatch = jest.fn();
		const thunk = fetchModerators();
		thunk(dispatch);
		expect(findModerators).toBeCalled();
	});
});

