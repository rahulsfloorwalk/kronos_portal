import $ from "jquery";
import { url } from "../../../config.js";

export function fetchAllStores(){
	return $.get( url.api_base_path + "client/store");
}

export function fetchStores(cityId){
	return $.get( url.api_base_path + "client/store", {city_id: cityId});
}

export function fetchStoresByAuditCycleAndCity(auditCycleId, cityId){
	return $.get( url.api_base_path + `client/report/audit_cycle/${auditCycleId}/city/${cityId}/store`);
}

export function fetchStore(storeId){
	return $.get( url.api_base_path + `client/store/${storeId}`);
}

export function fetchStoreMarkingTrends(storeId, questionnaireTypeId){
	return $.get( url.api_base_path + `client/report/questionnaire_type/${questionnaireTypeId}/store/${storeId}/marking`);
}

export function fetchStorePerformance(storeId, questionnaireTypeId){
	return $.get( url.api_base_path + `client/report/questionnaire_type/${questionnaireTypeId}/store/${storeId}/marking_graph`);
}
