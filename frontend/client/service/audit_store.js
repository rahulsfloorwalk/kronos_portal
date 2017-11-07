import $ from 'jquery'
import { url } from '../../config.js'

export function fetchLatestAuditStores(){
	return $.get( url.api_base_path + `client/audit_store/latest`);
};

export function fetchUpcomingAuditStores(){
	return $.get( url.api_base_path + `client/audit_store/upcoming`);
};

export function fetchAuditStoresByStore(storeId){
	return $.get( url.api_base_path + `client/store/${storeId}/audit_store`);
};

export function fetchAuditStore(auditStoreId){
	return $.get( url.api_base_path + `client/audit_store/${auditStoreId}`);
};

export function fetchAuditStoreByAuditCycleAndStore(auditCycleId, storeId){
	return $.get( url.api_base_path + `client/report/audit_cycle/${auditCycleId}/store/${storeId}/audit_store`);
};

export function findAuditStoresByAuditCycle(auditCycleId){
	return $.get( url.api_base_path + `client/report/audit_cycle/${auditCycleId}/audit_store`);
};
