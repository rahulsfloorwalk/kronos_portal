import $ from "jquery";
import { url } from "../../../config.js";


export function fetchproofTags(auditcycleId){
	return $.get(url.api_base_path+ `auditor/audit_cycle/${auditcycleId}/attachment_proof_tag_list`);
}

export function saveAttachmentTag(attachmentId, proof_tag_id){
	return $.ajax({
		url: url.api_base_path + `auditor/attachment/${attachmentId}/proof_tag`,
		type: "POST",
		data: JSON.stringify({proof_tag_id: proof_tag_id}),
		contentType: "application/json"
	});
}

export function saveNotAvailableTag( proof_tag_id,prooftagTextareaValue,auditStoreId){
	return $.ajax({
		url: url.api_base_path + "auditor/proof_notavailable",
		type: "POST",
		data: JSON.stringify({proof_tag_id: proof_tag_id,prooftagTextareaValue: prooftagTextareaValue,audit_store_id:auditStoreId}),
		contentType: "application/json"
	});
}
