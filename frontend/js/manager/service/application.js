import $ from 'jquery'
import { url } from '../../../config.js'
import types from '../action_types.js';

export function fiatAssignAudit(audit_id, email, audit_date){
	var promise = $.ajax({
		url: url.api_base_path + `manager/audit/${audit_id}/assign`,
		method: 'POST',
		data: JSON.stringify({
			email,
			audit_date
		}),
		contentType: 'application/json'
	});
	return promise;
};

