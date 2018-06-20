import $ from 'jquery'
import { url } from '../../../config.js'

export function fetchAuditTypes(){
	return $.get( url.api_base_path + `client/types`);
};

export function fetchQuestionnaireTypes(){
	return $.get( url.api_base_path + "client/questionnaire_types");
}

export function fetchLatestAuditCycleMatrix(){
	return $.get( url.api_base_path + `client/audit_cycle/aggregation`);
};

export function fetchAuditCycleCityMatrix(auditCycleId){
	return $.get( url.api_base_path + `client/report/audit_cycle/${auditCycleId}`);
};

export function fetchCityWisePerformance(questionnaire_type_id){
	return $.get( url.api_base_path + `client/dashboard/questionnaire_type/${questionnaire_type_id}/city_trends`);
}

export function fetchStoreWisePerformance(questionnaire_type_id){
	return $.get( url.api_base_path + `client/dashboard/questionnaire_type/${questionnaire_type_id}/store_trends`);
}

export function fetchAuditCyclesTimeSeries(questionnaire_type_id){
	return $.get( url.api_base_path + `client/dashboard/questionnaire_type/${questionnaire_type_id}/time_series`);
}
