import $ from "jquery";
import { url } from "../../../config.js";


export function findStoresByPercentage(audit_cycle_id, section_id, percentage){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + "client/store_performance_store_list_by_percentage",
		data: JSON.stringify({
			percentage: percentage,
			audit_cycle_id: audit_cycle_id,
			section_id: section_id
		}),
		contentType: "application/json"
	});
}