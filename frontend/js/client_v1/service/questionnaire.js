import $ from "jquery";
import { url } from "../../../config.js";

export function fetchIndustry(){
	return $.get( url.api_base_path + "client_v1/industry");
}

export function fetchProblemStatements(industry_id){
	return $.get( url.api_base_path + `client_v1/industry/${industry_id}/problem_statement`);
}

export function fetchSampleQuestionnaireType(problem_statement_id){
	return $.get( url.api_base_path + `client_v1/problem_statement/${problem_statement_id}/questionnaire_type`);
}

export function fetchSampleQuestionnaires(questionnaire_type_id){
	return $.get( url.api_base_path + `client_v1/questionnaire_type/${questionnaire_type_id}/questionnaire`);
}

export function insertSampleQuestionnaire(audit_cycle_id, sample_questionnaire_id){
	return $.get( url.api_base_path + `client_v1/audit_cycle/${audit_cycle_id}/sample_questionnaire/${sample_questionnaire_id}/insert`);
}