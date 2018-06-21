import $ from "jquery";
import { url } from "../../../config.js";

export function fetchReportSections(auditStoreId){
	return $.get( url.api_base_path + `client/audit_store/${auditStoreId}/report_section`);
}

