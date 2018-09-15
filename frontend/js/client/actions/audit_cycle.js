import { FETCH_AUDIT_CYCLES, SELECT_AUDIT_CYCLE } from "../action_types.js";
import * as auditCycles from "../service/audit_cycle.js";

export function fetchAuditCycles(){
	return function(dispatch){
		return auditCycles.fetchAuditCycles().then((auditCycles) => {
			dispatch({
				type: FETCH_AUDIT_CYCLES,
				auditCycles,
			});
		});
	};
}

export function selectAuditCycle(selectedAuditCycleId){
	return {
		type: SELECT_AUDIT_CYCLE,
		selectedAuditCycleId,
	};
}

