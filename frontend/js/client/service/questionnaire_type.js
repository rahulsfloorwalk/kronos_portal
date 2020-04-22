import $ from "jquery";
import { url } from "../../../config.js";

export function fetchQuestionnaireTypes(){
	return $.get( url.api_base_path + "client/questionnaire_types");
}

export function fetchQuestionnaireTypesForStore(store_id){
	return $.get( url.api_base_path + `client/store/${store_id}/questionnaire_types_list`);
}

export function fetchQuestionnaireTypesForProofComparison(store_id){
	return $.get( url.api_base_path + `client/store/${store_id}/questionnaire_types_list_for_comparison`);
}

export function fetchQuestionnaireTypesForDashboard(){
	return $.get( url.api_base_path + "client/questionnaire_types_for_dashboard");
}
