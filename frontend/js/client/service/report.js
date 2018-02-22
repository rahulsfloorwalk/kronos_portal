import $ from 'jquery'
import { url } from '../../../config.js'

export function fetchStoreSectionAverageByAuditCycle(auditCycleId, storeId){
	return $.get( url.api_base_path + `client/report/audit_cycle/${auditCycleId}/store/${storeId}`);
};

export function fetchCitySectionAverageByAuditCycle(auditCycleId, cityId){
	return $.get( url.api_base_path + `client/report/audit_cycle/${auditCycleId}/city/${cityId}`);
};

