import $ from 'jquery'
import { url } from '../../../config.js'

export function setAuditDate(audit_store_id, audit_date){
	console.log(audit_store_id, audit_date);
	return $.ajax({
		url: url.api_base_path + `manager/audit_store/${audit_store_id}/audit_date`,
		method: 'POST',
		data: JSON.stringify({
			audit_date
		}),
		contentType: 'application/json'
	});
};

