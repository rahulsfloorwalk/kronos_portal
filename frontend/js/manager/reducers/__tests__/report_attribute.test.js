import { rootReducer } from "../../reducers.js";

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

describe(types.REPORT_ATTRIBUTE_GET, () => {
	it("it sets the report attributes with audit cycle as the key", () => {
		const auditCycleId = 5;
		const reportAttributes = [];
		const nextState = rootReducer({}, fetchReportAttributesByAuditCycleId(auditCycleId, reportAttributes));

		expect(nextState).toEqual({
			reportAttributes: {
				[auditCycleId]: reportAttributes,
			},
		});
	});
});
