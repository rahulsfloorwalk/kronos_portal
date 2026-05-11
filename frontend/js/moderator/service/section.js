import $ from "jquery";
import { url } from "../../../config.js";

export function fetchSections(auditCycleId){
	return $.get( url.api_base_path + `moderator/audit_store/${auditCycleId}/section`);
}

export function fetchReportSections(auditStoreId){
	return $.get( url.api_base_path + `moderator/audit_store/${auditStoreId}/report_section`);
}

export function audioToCompareAnswers(payload) {
	return $.ajax({
		type: "POST",
		// url: "https://ai.floorwalk.in/audio_to_compare_answers/",
		url: url.api_base_path + "moderator/audio_to_compare_answers",
		data: JSON.stringify(payload),
		contentType: "application/json",
	});
}

export function audioToTextTranscription(payload) {
	return $.ajax({
		type: "POST",
		url: url.api_base_path + "moderator/audio_to_text",
		data: JSON.stringify(payload),
		contentType: "application/json",
	});
}
export function aiAnalysis(payload) {
	return $.ajax({
		type: "POST",
		url: url.api_base_path + "moderator/transcript_to_compare_answers",
		data: JSON.stringify(payload),
		contentType: "application/json",
	});
}
export function submitPMComment(auditStoreId, sectionId, pmComment){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + `moderator/audit_store/${auditStoreId}/section/${sectionId}/pm_comment`,
		data: JSON.stringify({
			pm_comment: pmComment
		}),
		contentType: "application/json"
	});
}

export function submitAuditorComment(auditStoreId, sectionId, auditorComment){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + `moderator/audit_store/${auditStoreId}/section/${sectionId}/auditor_comment`,
		data: JSON.stringify({
			auditor_comment: auditorComment
		}),
		contentType: "application/json"
	});
}

export function setSectionRevertMessage(audit_store_id, sectionId, revert_message){
	return $.ajax({
		url: url.api_base_path + `moderator/audit_store/${audit_store_id}/section/${sectionId}/section_revert_message`,
		method: "POST",
		data: JSON.stringify({
			revert_message
		}),
		contentType: "application/json"
	});
}

export function setNotApplicable(auditStoreId, sectionId, notApplicable){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + `moderator/audit_store/${auditStoreId}/section/${sectionId}/not_applicable`,
		data: JSON.stringify({
			not_applicable: notApplicable
		}),
		contentType: "application/json"
	});
}

