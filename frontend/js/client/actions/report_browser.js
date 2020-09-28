import { findAuditStoresByAuditCycle } from "../service/audit_store";
import * as reportBrowserActionCreators from "../reducers/report_browser";
import { setLoading, setSuccess } from "../reducers/loading";
import apiNames from "../api_names";

export function fetchReportsByAuditCycleId(auditCycleId){
	return (dispatch) => {
		dispatch(setLoading(apiNames.report.findByAuditCycleId));
		return findAuditStoresByAuditCycle(auditCycleId).then((reports) => {
			dispatch(reportBrowserActionCreators.fetchReportsByAuditCycleId(auditCycleId, reports));
			dispatch(setSuccess(apiNames.report.findByAuditCycleId));
		});
	};
}

export function selectState(selectedState){
	return function(dispatch){
		if(!selectedState) {
			dispatch(reportBrowserActionCreators.resetCityFilter());
		}
		dispatch(reportBrowserActionCreators.selectState(selectedState));
	};
}

export function selectCountry(selectedCountry){
	return function(dispatch){
		if(!selectCountry) {
			dispatch(reportBrowserActionCreators.resetStateFilter());
			dispatch(reportBrowserActionCreators.resetCityFilter());
		}
		dispatch(reportBrowserActionCreators.selectCountry(selectedCountry));
	};
}


