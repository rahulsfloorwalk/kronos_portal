import $ from 'jquery'
import { url } from '../../config.js'

export function fetchAuditCycles(){
	return $.get( url.api_base_path + `client/audit_cycle`);
};

export function fetchAuditCyclesTimeSeries(){
	return $.get( url.api_base_path + `client/report/audit_cycle/time_series`);
};
