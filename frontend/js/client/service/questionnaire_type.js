import $ from "jquery";
import { url } from "../../../config.js";

export function fetchQuestionnaireTypes(){
	return $.get( url.api_base_path + "client/questionnaire_types");
}

export function fetchQuestionnaireTypesForDashboard(){
	return $.get( url.api_base_path + "client/questionnaire_types_for_dashboard");
}
