import $ from "jquery";
import { url } from "../../../config.js";

export function getAuditorApplications(audit_id){
	return $.get( url.api_base_path + `manager/auditor/${audit_id}/applications`);
}

export function getAuditorReports(audit_id){
	return $.get( url.api_base_path + `manager/auditor/${audit_id}/reports`);
}
