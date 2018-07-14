
import axios from "axios";

export function findAttachmentsByAuditStore(auditStoreId){
	return axios.get(`/agency/audit_store/${auditStoreId}/attachment`).then((r) => r.data);
}

export function findAttachmentsByAuditStoreAndSection(auditStoreId, sectionId){
	return axios.get(`/agency/audit_store/${auditStoreId}/section/${sectionId}/attachment`).then((r) => r.data);
}

export function deleteAttachment(attachmentId){
	return axios.delete(`/agency/attachment/${attachmentId}`).then((r) => r.data);
}

export function completeAttachment(attachmentId){
	return axios.post(`/agency/attachment/${attachmentId}/complete`).then((r) => r.data);
}

export function uploadFileForAuditStore(auditStoreId, file, progressCallback){
	return doAttachmentUpload(`/agency/audit_store/${auditStoreId}/attachment`, file, progressCallback);
}

export function uploadFileForReportSection(auditStoreId, sectionId, file, progressCallback){
	return doAttachmentUpload(`/agency/audit_store/${auditStoreId}/section/${sectionId}/attachment`, file, progressCallback);
}

export function doAttachmentUpload(url, file, progressCallback){
	return new Promise((resolve, reject) => {

		const payload = {
			"file_name": file.name,
			"file_size": file.size,
			"file_type": file.type
		};

		progressCallback("INIT");
		const req = axios.post(url, payload).then((r) => r.data);

		req.then((post_data) => {
			progressCallback("STARTING_UPLOAD");

			const formData = new FormData();
			formData.append("AWSAccessKeyId", post_data.fields.AWSAccessKeyId);
			formData.append("acl", post_data.fields.acl);
			formData.append("Policy", post_data.fields.policy);
			formData.append("signature", post_data.fields.signature);
			formData.append("key", post_data.fields.key);
			formData.append("success_action_status", "201");
			formData.append("file", file);

			axios.post(post_data.url, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
				onUploadProgress: (progressEvent) => {
					if(progressEvent.lengthComputable){
						const max = progressEvent.total;
						const current = progressEvent.loaded;

						const percentage = (current * 100)/max;
						progressCallback("UPLOAD_PROGRESS", percentage);
					}
				},
			}).then(() => {
				completeAttachment(post_data.attachment.id).then(() => {
					resolve();
				}, () => {
					reject("There was an error, please try again.");
				});
			}, () => {
				reject("There was an error, please try again.");
			});
		}, (err) => {
			if(err && err.responseJSON && err.responseJSON.non_field_errors){
				reject(err.responseJSON.non_field_errors[0]);
			} else {
				reject("There was an error, please try again.");
			}
		});
	});
}
