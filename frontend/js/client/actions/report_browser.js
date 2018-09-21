import { findAuditStoresByAuditCycle } from "../service/audit_store";
import {
	FETCH_REPORTS,
	SELECT_CITY,
	SELECT_STORE_TYPE,
	SELECT_PRIORITY,
	SELECT_START_DATE,
	SELECT_END_DATE,
} from "../action_types";

export function fetchReportsByAuditCycle(auditCycleId){
	return function(dispatch){
		return findAuditStoresByAuditCycle(auditCycleId).then((reports) => {
			dispatch({
				type: FETCH_REPORTS,
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

