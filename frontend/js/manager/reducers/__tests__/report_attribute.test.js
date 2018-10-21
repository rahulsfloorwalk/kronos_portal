import { fetchReportAttributesByAuditCycleId } from "../report_attribute";
import types from "../../action_types";

describe("fetchReportAttributesByAuditCycleId", () => {
	it("returns an action with the given auditCycleId and reportAttributes", () => {
		const auditCycleId = 5;
		const reportAttributes = [];

		expect(fetchReportAttributesByAuditCycleId(auditCycleId, reportAttributes)).toEqual({
			type: types.REPORT_ATTRIBUTE_GET,
			auditCycleId,
			reportAttributes,
		});
	});
});