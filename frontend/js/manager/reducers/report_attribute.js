import types from "../action_types";

export function fetchReportAttributesByAuditCycleId(auditCycleId, reportAttributes) {
	return {
		type: types.REPORT_ATTRIBUTE_GET,
		auditCycleId,
		reportAttributes
	};
}