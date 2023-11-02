import $ from "jquery";
import { url } from "../../../config.js";

export function findAppliedAudits(){
	return $.get( url.api_base_path + "auditor/applied_audits");
}

export function findAppliedAuditsLoadMore(is_load_more, applied_audits_count){
	return $.get( url.api_base_path + `auditor/applied_audits?is_load_more=${is_load_more}&last_total_count=${applied_audits_count}`);
}