import $ from "jquery";
import { url } from "../../../config.js";

export function fetchAuditCyclesByClient(clientId){
	return $.get( url.api_base_path + `manager/client/${clientId}/audit_cycle`);
}
