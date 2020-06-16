import $ from "jquery";
import { url } from "../../../config.js";

export function findAttachmentsByUser(){
	return $.get(url.api_base_path + "auditor/id_proof/attachment");
}

export function findAttachmentsByAuditStore(auditStoreId){
	return $.get( url.api_base_path + `auditor/audit_store/${auditStoreId}/attachment`);
}

export function findAttachmentsByAuditStoreAndSection(auditStoreId, sectionId){
	return $.get( url.api_base_path + `auditor/audit_store/${auditStoreId}/section/${sectionId}/attachment`);
}

export function deleteAttachment(attachmentId){
	return $.ajax({
		url: url.api_base_path + `auditor/attachment/${attachmentId}`,
		type: "DELETE"
	});
}

export function completeAttachment(attachmentId){
	return $.ajax({
		url: url.api_base_path + `auditor/attachment/${attachmentId}/complete`,
		type: "POST"
	});
}

export function uploadFileForUser(file){
	var req_url = url.api_base_path + "auditor/id_proof/attachment";
	return doAttachmentUpload(req_url, file);
}

export function uploadFileForAuditStore(auditStoreId, file){
	var req_url = url.api_base_path + `auditor/audit_store/${auditStoreId}/attachment`;
	return doAttachmentUpload(req_url, file);
}

export function uploadFileForReportSection(auditStoreId, sectionId, file){
	var req_url = url.api_base_path + `auditor/audit_store/${auditStoreId}/section/${sectionId}/attachment`;
	return doAttachmentUpload(req_url, file);
}

export function doAttachmentUpload(url, file){
	let mainPromise = $.Deferred();

	let payload = {
		"file_name": file.name,
		"file_size": file.size,
		"file_type": file.type
	};

	mainPromise.notify("INIT");
	let req = $.ajax({
		type: "POST",
		url: url,
		data: JSON.stringify(payload),
		contentType: "application/json"
	});

	req.done(function(post_data){
		mainPromise.notify("STARTING_UPLOAD");

		var formData = new FormData();
		formData.append("x-amz-credential", post_data.fields['x-amz-credential']);
		formData.append("x-amz-algorithm", post_data.fields['x-amz-algorithm']);
		formData.append("x-amz-date", post_data.fields['x-amz-date']);
		formData.append("x-amz-signature", post_data.fields['x-amz-signature']);
		formData.append("acl", post_data.fields.acl);
		formData.append("policy", post_data.fields.policy);
		formData.append("key", post_data.fields.key);
		formData.append("success_action_status", "201");
		formData.append("file", file);

		$.ajax({
			url: post_data.url,
			type: "POST",
			data: formData,
			processData: false,
			contentType: false,
			xhr: function() {
				let myXhr = $.ajaxSettings.xhr();
				if(myXhr.upload){
					myXhr.upload.addEventListener("progress",function(e){
						if(e.lengthComputable){
							let max = e.total;
							let current = e.loaded;

							let percentage = (current * 100)/max;
							mainPromise.notify("UPLOAD_PROGRESS", percentage);
						}
					}, false);
				}
				return myXhr;
			},
		}).then(function(){
			completeAttachment(post_data.attachment.id).then(function(){
				mainPromise.resolve();
			}, function(){
				mainPromise.reject("There was an error, please try again.");
			});
		}, function(){
			mainPromise.reject("There was an error, please try again.");
		});
	});

	req.fail(function(err){
		if(err && err.responseJSON && err.responseJSON.non_field_errors){
			mainPromise.reject(err.responseJSON.non_field_errors[0]);
		} else {
			mainPromise.reject("There was an error, please try again.");
		}
	});

	return mainPromise;
}

export function moveAttachmentToSection(auditStoreId,sectionId,attachmentIdList){
	return $.ajax({
		url: url.api_base_path + `auditor/attachment/${auditStoreId}/movetosection_auditor`,
		type: "POST",
		data: JSON.stringify({section_id: sectionId , attachment_list: attachmentIdList}),
		contentType: "application/json"
	});
}
