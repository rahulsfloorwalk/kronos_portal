import $ from "jquery";
import { url } from "../../../config.js";

export function findAttachmentsByAuditStore(auditStoreId){
	return $.get( url.api_base_path + `manager/audit_store/${auditStoreId}/attachment`);
}

export function findAttachmentsByAuditStoreAndSection(auditStoreId, sectionId){
	return $.get( url.api_base_path + `manager/audit_store/${auditStoreId}/section/${sectionId}/attachment`);
}

export function deleteAttachment(attachmentId){
	return $.ajax({
		url: url.api_base_path + `manager/attachment/${attachmentId}`,
		type: "DELETE"
	});
}

export function completeAttachment(attachmentId){
	return $.ajax({
		url: url.api_base_path + `manager/attachment/${attachmentId}/complete`,
		type: "POST"
	});
}

export function renameAttachment(attachmentId, fileName){
	return $.ajax({
		url: url.api_base_path + `manager/attachment/${attachmentId}/rename`,
		type: "POST",
		data: JSON.stringify({file_name: fileName}),
		contentType: "application/json"
	});
}

export function uploadFileForReportSection(auditStoreId, sectionId, file){
	var req_url = url.api_base_path + `manager/audit_store/${auditStoreId}/section/${sectionId}/attachment`;
	return doAttachmentUpload(req_url, file);
}

export function uploadFileForAuditStore(auditStoreId, file){
	var req_url = url.api_base_path + `manager/audit_store/${auditStoreId}/attachment`;
	return doAttachmentUpload(req_url, file);
}

export function doAttachmentUpload(url, file){
	var mainPromise = $.Deferred();

	var payload = {
		"file_name": file.name,
		"file_size": file.size,
		"file_type": file.type
	};

	mainPromise.notify("INIT");
	var req = $.ajax({
		type: "POST",
		url: url,
		data: JSON.stringify(payload),
		contentType: "application/json"
	});

	req.done(function(post_data){
		mainPromise.notify("STARTING_UPLOAD");

		var formData = new FormData();
		formData.append("x-amz-credential", post_data.fields["x-amz-credential"]);
		formData.append("x-amz-algorithm", post_data.fields["x-amz-algorithm"]);
		formData.append("x-amz-date", post_data.fields["x-amz-date"]);
		formData.append("x-amz-signature", post_data.fields["x-amz-signature"]);
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
				var myXhr = $.ajaxSettings.xhr();
				if(myXhr.upload){
					myXhr.upload.addEventListener("progress",function(e){
						if(e.lengthComputable){
							var max = e.total;
							var current = e.loaded;

							var percentage = (current * 100)/max;
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
				mainPromise.reject();
			});
		}, function(){
			mainPromise.reject();
		});
	});

	req.fail(function(err){
		if( err.responseJSON && err.responseJSON.non_field_errors){
			mainPromise.reject(err.responseJSON.non_field_errors[0]);
		} else {
			mainPromise.reject();
		}
	});

	return mainPromise;
}

export function moveAttachmentToSection(auditStoreId,sectionId,attachmentIdList){
	return $.ajax({
		url: url.api_base_path + `manager/attachment/${auditStoreId}/movetosection_manager`,
		type: "POST",
		data: JSON.stringify({section_id: sectionId , attachment_list: attachmentIdList}),
		contentType: "application/json"
	});
}