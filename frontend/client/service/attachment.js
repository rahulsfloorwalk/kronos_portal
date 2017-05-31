
import $ from 'jquery'
import { url } from '../../config.js'

export function findAttachmentsByAuditStore(auditStoreId){
	return $.get( url.api_base_path + `client/audit_store/${auditStoreId}/attachment`);
};


export function findAttachmentsByAuditStoreAndSection(auditStoreId, sectionId){
	return $.get( url.api_base_path + `client/audit_store/${auditStoreId}/section/${sectionId}/attachment`);
};

