import $ from "jquery";
import { url } from "../../../config.js";

export function fetchClientHandles(){
	return $.get( url.api_base_path + "client/twitter/handles");
}

export function fetchReportSummaryClientHandles(){
	return $.get( url.api_base_path + "client/report_summary/handles");
}

export function fetchClientReportSummaryFeedByHandle(audit_cycle_id){
	return $.get( url.api_base_path + `client/summary/audit_report/${audit_cycle_id}`);
}

export function fetchSentimetModalData(auditid){
	return $.get( url.api_base_path + `client/sentiment_data/${auditid}`);
}

export function fetchClientTwitterFeedByHandle(handle_id){
	return $.get( url.api_base_path + `client/twitter/handles/${handle_id}/feed`);
}

// use this to get comparison and stats data across twitter handles
export function fetchClientTwitterStats(){
	return $.get( url.api_base_path + "client/twitter_stats");
}
