import $ from "jquery";
import { url } from "../../../config.js";

export function fetchAllStores(data){
	return $.get( url.api_base_path + "client/store", data);
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

export function fetchAuditCyclesYearList(){
	return $.get( url.api_base_path + "client/audit_cycle_year_list");
}

export function fetchFilterStores(storeCode, selectedCity, percentFrom, percentTo){
	return $.ajax({
		type: "POST",
		url : url.api_base_path + "client/filter_stores",
		data: JSON.stringify({
			store_code : storeCode,
			selected_city: selectedCity,
			percent_from: percentFrom,
			percent_to: percentTo
		}),
		contentType: "application/json"
	});
}