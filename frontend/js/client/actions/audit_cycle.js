import * as auditCycles from "../service/audit_cycle.js";
import * as auditCycleActionCreators from "../reducers/audit_cycle";
import * as reportBrowserActionCreators from "../reducers/report_browser";
import {fetchReportAttributesByAuditCycleId} from "./report_attribute";

export function fetchAuditCycles(){
	return function(dispatch){
		return auditCycles.fetchAuditCycles().then((auditCycles) => {
			dispatch(auditCycleActionCreators.fetchAuditCycles(auditCycles));
		});
	};
}

export function selectAuditCycle(selectedAuditCycleId){
	return function(dispatch){
		dispatch(auditCycleActionCreators.selectAuditCycle(selectedAuditCycleId));
		dispatch(reportBrowserActionCreators.resetDependentFilters());
		dispatch(fetchReportAttributesByAuditCycleId(selectedAuditCycleId));
	};
}

