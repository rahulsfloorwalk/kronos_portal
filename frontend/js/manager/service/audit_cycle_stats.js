import $ from 'jquery'
import { url } from '../../../config.js'

export function getAuditCycleStats(audit_cycle_id){
	return $.get( url.api_base_path + `manager/audit_cycle/${audit_cycle_id}/stats`);
};
