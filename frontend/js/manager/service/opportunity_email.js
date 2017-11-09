import $ from 'jquery'
import { url } from '../../../config.js'

export function findOpportunityEmailRecordsByAuditCycleId(audit_cycle_id){
	return $.get( url.api_base_path + `manager/audit_cycle/${audit_cycle_id}/opportunity_email`);
};

export function saveOpportunityEmailRecord(audit_cycle_id, city_id){
	return $.ajax({
		url: url.api_base_path + `manager/audit_cycle/${audit_cycle_id}/opportunity_email`,
		method: 'POST',
		data: JSON.stringify({ city_id, }),
		contentType: 'application/json'
	});
};

