import * as service from "../service/report_attribute";
import * as reportAttributeActionCreators from "../reducers/report_attribute";

export function fetchReportAttributesByAuditCycleId(auditCycleId){
	return (dispatch) => {
		return service.fetchReportAttributesByAuditCycleId(auditCycleId).then((reportAttributes) => {
			dispatch(reportAttributeActionCreators.fetchReportAttributesByAuditCycleId(auditCycleId, reportAttributes));
		});
	};
}


