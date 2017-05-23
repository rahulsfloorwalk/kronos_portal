import $ from 'jquery'
import { url } from '../../config.js'

export function fetchAuditCycles(){
	return $.get( url.api_base_path + `client/audit_cycle`);
};

export function findAuditCyclesByType(auditType){
	return $.get( url.api_base_path + `client/audit_cycle/${auditType}`);
};

export function fetchAuditCyclesTimeSeries(audit_type){
	return $.get( url.api_base_path + `client/report/audit_cycle/time_series`, {
		audit_type
	});
};

export function fetchAuditCycleStorePerformance(audit_type){
	return $.get( url.api_base_path + `client/report/performance/store`, {
		audit_type
	});
};
