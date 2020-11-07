import $ from "jquery";
import { url } from "../../../config.js";

export function getReportsActionList(){
	return $.get( url.api_base_path + "client/action_reports");
}

export function changeStatusActionPlan(action_plan_id){
	return $.get( url.api_base_path + `client/action_report/${action_plan_id}/change_status`);
}
