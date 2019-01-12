import $ from "jquery";
import { url } from "../../../config.js";

export function findImpactFactorsByAuditStore(auditStoreId){
	return $.get( url.api_base_path + `client/audit_store/${auditStoreId}/impact_factor`);
}