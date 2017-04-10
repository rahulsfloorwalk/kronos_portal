import $ from 'jquery'
import { url } from '../../../config.js'

export function findAttachmentsByAuditStore(auditStoreId){
	return $.get( url.api_base_path + `manager/audit_store/${auditStoreId}/attachment`);
};

export function deleteAttachment(attachmentId){
	return $.ajax({
		url: url.api_base_path + `manager/attachment/${attachmentId}`,
		type: "DELETE"
	});
};

export function completeAttachment(attachmentId){
	return $.ajax({
		url: url.api_base_path + `manager/attachment/${attachmentId}/complete`,
		type: "POST"
	});
};

export function renameAttachment(attachmentId, fileName){
	return $.ajax({
		url: url.api_base_path + `manager/attachment/${attachmentId}/rename`,
		type: "POST",
		data: JSON.stringify({file_name: fileName}),
		contentType: "application/json"
	});
};


export function uploadFileForAuditStore(auditStoreId, file){
	var mainPromise = $.Deferred();
	var req_url = url.api_base_path + `manager/audit_store/${auditStoreId}/attachment`;

	var payload = {
		"file_name": file.name,
		"file_size": file.size,
		"file_type": file.type
	};

	mainPromise.notify("INIT");
	var req = $.ajax({
		type: "POST",
		url: req_url,
		data: JSON.stringify(payload),
		contentType: "application/json"
	});

	req.done(function(post_data){
		mainPromise.notify("STARTING_UPLOAD");

		var formData = new FormData();
		formData.append("AWSAccessKeyId", post_data.fields.AWSAccessKeyId);
		formData.append("acl", post_data.fields.acl);
		formData.append("Policy", post_data.fields.policy);
		formData.append("signature", post_data.fields.signature);
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
					myXhr.upload.addEventListener('progress',function(e){
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
};

