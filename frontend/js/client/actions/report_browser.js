import {
	SELECT_CITY,
	SELECT_STORE_TYPE,
	SELECT_PRIORITY,
	SELECT_START_DATE,
	SELECT_END_DATE,
	FETCH_REPORTS,
	RESET_FILTERS,
} from "../action_types";
import { findAuditStoresByAuditCycle } from "../service/audit_store";
import * as reportBrowserActionCreators from "../reducers/report_browser";

export function fetchReportsByAuditCycleId(auditCycleId){
	return (dispatch) => {
		return findAuditStoresByAuditCycle(auditCycleId).then((reports) => {
			dispatch(reportBrowserActionCreators.fetchReportsByAuditCycleId(auditCycleId, reports));
		});
	};
}


