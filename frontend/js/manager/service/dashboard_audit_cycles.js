import $ from 'jquery'
import { url } from '../../../config.js'

export function getDashboardAuditCycles(){
	return $.get( url.api_base_path + `manager/audit_cycle/dashboard`);
};
