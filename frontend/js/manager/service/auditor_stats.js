import $ from 'jquery'
import { url } from '../../../config.js'

export function getAuditorStats(audit_id){
	return $.get( url.api_base_path + `manager/auditor/${audit_id}/stats`);
};
