import $ from 'jquery'
import { url } from '../../../config.js'

export function setAuditDate(audit_store_id, audit_date){
	return $.ajax({
		url: url.api_base_path + `manager/audit_store/${audit_store_id}/audit_date`,
		method: 'POST',
		data: JSON.stringify({
			audit_date
		}),
		contentType: 'application/json'
	});
};

export function assignAuditStoreToClientUser(audit_store_id, client_user_id){
	return $.ajax({
		url: url.api_base_path + `manager/audit_store/${audit_store_id}/client_user`,
		method: 'POST',
		data: JSON.stringify({
			client_user_id
		}),
		contentType: 'application/json'
	});
};

export function revokeAuditStoreFromClientUser(audit_store_id, client_user_id){
	return $.ajax({
		url: url.api_base_path + `manager/audit_store/${audit_store_id}/client_user`,
		method: 'DELETE',
		data: JSON.stringify({
			client_user_id
		}),
		contentType: 'application/json'
	});
};
