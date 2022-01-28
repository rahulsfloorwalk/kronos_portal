import $ from "jquery";
import { url } from "../../../config.js";

export function fetchSectionProofTag(section_id){
	return $.get( url.api_base_path + `manager/section/${section_id}/proof_tag`);
}

export function saveSectionProofTag(section_id, audit_cycle_id, proof_tag_list, required_proof_tag_list){
	return $.ajax({
		url: url.api_base_path + `manager/section/${section_id}/proof_tag`,
		method: "POST",
		data: JSON.stringify({
			proof_tag_list,
			required_proof_tag_list,
			audit_cycle_id
		}),
		contentType: "application/json"
	});
}
