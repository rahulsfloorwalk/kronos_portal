import { fetchReportAttributesByAuditCycleId } from "../report_attribute.js";
import $ from "jquery";
jest.mock("jquery");

beforeEach(() => {
	$.get = jest.fn();
	$.ajax = jest.fn();
});

describe(fetchReportAttributesByAuditCycleId, () => {
	it("performs a GET to the correct URL", () => {
		fetchReportAttributesByAuditCycleId(5);
		expect($.get).toBeCalledWith("/client/audit_cycle/5/report_attribute");
	});
});

