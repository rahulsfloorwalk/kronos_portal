import types from "../action_types.js";
import { findModeratorSummaryByAuditCycle } from "../service/moderator";
import { findModerators } from "../service/moderator";

export const fetchModeratorSummaryByAuditCycle = (auditCycleId) => {
	return (dispatch) => {
		return findModeratorSummaryByAuditCycle(auditCycleId).then((summaryData) => {
			dispatch({
				type: types.AUDIT_CYCLE_MODERATOR_SUMMARY,
				auditCycleId: auditCycleId,
				moderatorSummary: summaryData,
			});
			return summaryData;
		});
	};
};

export const fetchModerators = () => {
	return (dispatch) => {
		return findModerators().then((moderators) => {
			dispatch({
				type: types.MODERATOR_GET,
				moderators,
			});
			return moderators;
		});
	};
};

