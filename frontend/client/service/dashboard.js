import $ from 'jquery'
import { url } from '../../config.js'

export function fetchLatestAuditCycleMatrix(){
	return $.get( url.api_base_path + `client/audit_cycle/aggregation`);
};
