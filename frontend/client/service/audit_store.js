import $ from 'jquery'
import { url } from '../../config.js'

export function fetchLatestAuditStores(){
	return $.get( url.api_base_path + `client/audit_store/latest`);
};

export function fetchAuditStores(storeId){
	return $.get( url.api_base_path + `client/store/${storeId}/audit_store`);
};

export function fetchAuditStore(auditStoreId){
	return $.get( url.api_base_path + `client/audit_store/${auditStoreId}`);
};
