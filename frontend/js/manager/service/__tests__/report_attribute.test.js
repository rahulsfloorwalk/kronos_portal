import { fetchReportAttributesByAuditCycleId } from "../../../manager/service/report_attribute";
import $ from "jquery";

jest.mock("jquery", () => ({
	get: jest.fn(),
}));

describe("fetchReportAttributesByAuditCycleId", () => {
	it("calls the url to fetch report attributes by audit cycle id ", () => {
		fetchReportAttributesByAuditCycleId(1);
		expect($.get).toBeCalledWith("/manager/audit_cycle/1/report_attribute");
	});
});
