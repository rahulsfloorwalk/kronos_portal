import $ from "jquery";
import { url } from "../../../config.js";

export function fetchQuestionnaireTypes(clientId){
	return $.get( url.api_base_path + `manager/client/${clientId}/questionnaire_type`);
}
