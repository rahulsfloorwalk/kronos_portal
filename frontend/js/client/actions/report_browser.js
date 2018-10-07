import {
	SELECT_CITY,
	SELECT_STORE_TYPE,
	SELECT_PRIORITY,
	SELECT_START_DATE,
	SELECT_END_DATE,
	FETCH_REPORTS,
} from "../action_types";
import { findAuditStoresByAuditCycle } from "../service/audit_store";

export function fetchReportsByAuditCycleId(auditCycleId){
	return (dispatch) => {
		return findAuditStoresByAuditCycle(auditCycleId).then((reports) => {
			dispatch({
				type: FETCH_REPORTS,
				auditCycleId,
				reports,
			});
		});
	};
}

export function selectCity(selectedCityId){
	return {
		type: SELECT_CITY,
		selectedCityId,
	};
}

export function selectStoreType(selectedStoreType){
	return {
		type: SELECT_STORE_TYPE,
		selectedStoreType,
	};
}

export function selectPriority(selectedPriority){
	return {
		type: SELECT_PRIORITY,
		selectedPriority,
	};
}

export function selectStartDate(selectedStartDate){
	return {
		type: SELECT_START_DATE,
		selectedStartDate,
	};
}

export function selectEndDate(selectedEndDate){
	return {
		type: SELECT_END_DATE,
		selectedEndDate,
	};
}

