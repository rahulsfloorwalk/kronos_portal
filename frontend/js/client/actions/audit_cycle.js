import { FETCH_AUDIT_CYCLES, SELECT_AUDIT_CYCLE } from "../action_types.js";
import * as auditCycles from "../service/audit_cycle.js";
import * as auditCycleActionCreators from "../reducers/audit_cycle";
import * as reportBrowserActionCreators from "../reducers/report_browser";

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
	};
}

