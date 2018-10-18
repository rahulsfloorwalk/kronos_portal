import { FETCH_AUDIT_CYCLES, SELECT_AUDIT_CYCLE } from "../action_types";

const initialState = {
	auditCycles: [],
	selectedAuditCycleId: null,
};

export default (state=initialState, action) => {
	switch(action.type){
	case FETCH_AUDIT_CYCLES:
		return Object.assign({}, state, {
			auditCycles: action.auditCycles,
		});
	case SELECT_AUDIT_CYCLE:
		return Object.assign({}, state, {
			selectedAuditCycleId: action.selectedAuditCycleId,
		});
	default:
		return state;
	}
};

// Action Creators

export function fetchAuditCycles(auditCycles){
	return {
		type: FETCH_AUDIT_CYCLES,
		auditCycles,
	};
}


export function selectAuditCycle(selectedAuditCycleId){
	return {
		type: SELECT_AUDIT_CYCLE,
		selectedAuditCycleId,
	};
}

