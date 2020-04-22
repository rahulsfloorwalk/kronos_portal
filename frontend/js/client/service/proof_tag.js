import $ from "jquery";
import { url } from "../../../config.js";

export function fetchProofTagsByStore(storeId){
	return $.get( url.api_base_path + `client/store/${storeId}/proof_tag_list`);
}

export function getProofsByTag(storeId, questionnaireTypeId, proof_tag_id){
	return $.ajax({
		url: url.api_base_path + `client/store/${storeId}/get_proofs_by_tag`,
		type: "POST",
		data: JSON.stringify({proof_tag_id: proof_tag_id, questionnaireTypeId: questionnaireTypeId}),
		contentType: "application/json"
	});
}

export function fetchProofTagsByStoreAndQuestionnaireType(storeId, questionnaireTypeId){
	return $.ajax({
		url: url.api_base_path + `client/store/${storeId}/proof_tag_list_by_questionnaire_type`,
		type: "POST",
		data: JSON.stringify({questionnaireTypeId: questionnaireTypeId}),
		contentType: "application/json"
	});
}
