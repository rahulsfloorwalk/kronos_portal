import { findModeratorSummaryByAuditCycle } from "../moderator";
import $ from "jquery";

jest.mock("jquery", () => ({
	get: jest.fn(),
}));

describe(findModeratorSummaryByAuditCycle, () => {
	it("calls the url to fetch moderator summary for an audit cycle id ", () => {
		findModeratorSummaryByAuditCycle(1);
		expect($.get).toBeCalledWith("/manager/audit_cycle/1/moderator_summary");
	});
	it("returns the response from the GET call", () => {
		const sampleData = { 1: {"ASSIGNED": 1} };
		$.get.mockResolvedValue(sampleData);
		return expect(findModeratorSummaryByAuditCycle(1)).resolves.toEqual(sampleData);
	});
});
