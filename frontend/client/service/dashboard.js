import $ from 'jquery'
import { url } from '../../config.js'

export function fetchAuditTypes(){
	return $.get( url.api_base_path + `client/types`);
};

export function fetchLatestAuditCycleMatrix(){
	return $.get( url.api_base_path + `client/audit_cycle/aggregation`);
};

export function fetchAuditCycleCityMatrix(auditCycleId){
	return $.get( url.api_base_path + `client/report/audit_cycle/${auditCycleId}`);
};
