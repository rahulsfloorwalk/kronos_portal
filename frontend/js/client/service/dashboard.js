import $ from "jquery";
import { url } from "../../../config.js";

export function fetchLatestAuditCycleMatrix(){
	return $.get( url.api_base_path + "client/audit_cycle/aggregation");
}

export function fetchAuditCycleCityMatrix(auditCycleId){
	return $.get( url.api_base_path + `client/report/audit_cycle/${auditCycleId}`);
}

export function fetchCityWisePerformance(questionnaire_type_id){
	return $.get( url.api_base_path + `client/dashboard/questionnaire_type/${questionnaire_type_id}/city_trends`);
}

export function fetchCityWisePerformanceByAuditCycleId(questionnaire_type_id, audit_cycle_id){
	return $.get( url.api_base_path + `client/dashboard/questionnaire_type/${questionnaire_type_id}/audit_cycle/${audit_cycle_id}/city_trends`);
}

export function fetchRegionWisePerformanceByAuditCycleId(questionnaire_type_id, audit_cycle_id){
	return $.get( url.api_base_path + `client/dashboard/questionnaire_type/${questionnaire_type_id}/audit_cycle/${audit_cycle_id}/region_trends`);
}

export function fetchClusterWisePerformanceByAuditCycleId(questionnaire_type_id, audit_cycle_id){
	return $.get( url.api_base_path + `client/dashboard/questionnaire_type/${questionnaire_type_id}/audit_cycle/${audit_cycle_id}/cluster_trends`);
}

export function fetchStoreWisePerformance(questionnaire_type_id){
	return $.get( url.api_base_path + `client/dashboard/questionnaire_type/${questionnaire_type_id}/store_trends`);
}

export function fetchStoreWisePerformanceByAuditCycleId(questionnaire_type_id, audit_cycle_id){
	return $.get( url.api_base_path + `client/dashboard/questionnaire_type/${questionnaire_type_id}/audit_cycle/${audit_cycle_id}/store_trends`);
}

export function fetchAuditCyclesTimeSeries(questionnaire_type_id){
	return $.get( url.api_base_path + `client/dashboard/questionnaire_type/${questionnaire_type_id}/time_series`);
}

export function fetchAuditCyclesTimeSeriesByAuditCycleId(questionnaire_type_id, audit_cycle_id){
	return $.get( url.api_base_path + `client/dashboard/questionnaire_type/${questionnaire_type_id}/audit_cycle/${audit_cycle_id}/time_series`);
}

export function fetchAuditCycleScoreList(questionnaire_type_id){
	return $.get(url.api_base_path + `client/dashboard/questionnaire_type/${questionnaire_type_id}/audit_cycle_scores`);
}

export function fetchImrovableQuestionsByAuditCycleId(questionnaire_type_id, audit_cycle_id){
	return $.get( url.api_base_path + `client/dashboard/questionnaire_type/${questionnaire_type_id}/audit_cycle/${audit_cycle_id}/improvable_questions`);
}

export function fetchQuestionnaireSurveyByAuditCycleId(questionnaire_type_id, audit_cycle_id){
	return $.get( url.api_base_path + `client/dashboard/questionnaire_type/${questionnaire_type_id}/audit_cycle/${audit_cycle_id}/questionnaire_survey`);
}