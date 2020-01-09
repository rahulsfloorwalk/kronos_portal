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

export function fetchAuditCyclesForDashboard(){
	return function(dispatch){
		return auditCycles.fetchAuditCyclesForDashboard().then((auditCycles) => {
			dispatch(auditCycleActionCreators.fetchAuditCyclesForDashboard(auditCycles));
		});
	};
}

export function selectAuditCycle(selectedAuditCycleId){
	return function(dispatch){
		dispatch(auditCycleActionCreators.selectAuditCycle(selectedAuditCycleId));
		dispatch(reportBrowserActionCreators.resetDependentFilters());
	};
}

