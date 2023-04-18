import $ from "jquery";
import { url } from "../../../config.js";

export function findProofTag(){
	return $.get( url.api_base_path + "manager/proof_tag");
}

export function findById(proof_tag_id){
	return $.get( url.api_base_path + `manager/proof_tag/${proof_tag_id}`);
}

export function insert( name, description, is_active){
	return $.ajax({
		url: url.api_base_path + "manager/proof_tag",
		method: "POST",
		data: JSON.stringify({
			name,
			description,
			is_active
		}),
		contentType: "application/json"
	});
}

export function update(proof_tag_id, name, description, is_active){
	return $.ajax({
		url: url.api_base_path + `manager/proof_tag/${proof_tag_id}`,
		method: "POST",
		data: JSON.stringify({
			name,
			description,
			is_active
		}),
		contentType: "application/json"
	});
}

export function fetchproofTags(auditcycleId){
	return $.get(url.api_base_path+ `manager/audit_cycle/${auditcycleId}/attachment_proof_tag_list`);
}

export function saveAttachmentTag(attachmentId, proof_tag_id){
	return $.ajax({
		url: url.api_base_path + `manager/attachment/${attachmentId}/proof_tag`,
		type: "POST",
		data: JSON.stringify({proof_tag_id: proof_tag_id}),
		contentType: "application/json"
	});
}

export function getClientsByProofTagId(proof_tag_id){
	return $.get(url.api_base_path+ `manager/${proof_tag_id}/clients_list`);
}