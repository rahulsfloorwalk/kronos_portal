
import * as service from "../service/report_attribute";
import * as actionCreators from "../reducers/report_attribute";

export function fetchReportAttributes(auditCycleId){
	return (dispatch) => {
		const promise = service.fetchReportAttributesByAuditCycleId(auditCycleId);
		promise.then((reportAttributes) => {
			dispatch(actionCreators.fetchReportAttributesByAuditCycleId(auditCycleId, reportAttributes));
		});
		//TODO: Handle error

		return promise;
	};
}