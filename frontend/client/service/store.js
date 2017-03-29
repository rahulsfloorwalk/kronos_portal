import $ from 'jquery'
import { url } from '../../config.js'

export function fetchStores(cityId){
	return $.get( url.api_base_path + `client/store`, {city_id: cityId});
};

export function fetchStoresByAuditCycleAndCity(auditCycleId, cityId){
	return $.get( url.api_base_path + `client/report/audit_cycle/${auditCycleId}/city/${cityId}/store`);
};

export function fetchStore(storeId){
	return $.get( url.api_base_path + `client/store/${storeId}`);
};
