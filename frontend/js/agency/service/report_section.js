import axios from "axios";
import { url } from "../../../config";

export function fetchReportSections(auditStoreId){
	return axios.get( url.api_base_path + `agency/audit_store/${auditStoreId}/report_section`).then( r => r.data);
}

export function setAuditorComment(auditStoreId, sectionId, auditorComment){
	return axios.post( url.api_base_path + `agency/audit_store/${auditStoreId}/section/${sectionId}/comment`, {
		auditor_comment: auditorComment,
	}).then( r => r.data);
}

