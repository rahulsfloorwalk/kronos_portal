import $ from 'jquery'
import { url } from '../../../config.js'

export function assignStoreToClientUser(store_id, user_id){
	return $.ajax({
		url: url.api_base_path + `manager/store/${store_id}/client_user`,
		method: 'POST',
		data: JSON.stringify({
			user_id
		}),
		contentType: 'application/json'
	});
};

export function revokeStoreFromClientUser(store_id, user_id){
	return $.ajax({
		url: url.api_base_path + `manager/store/${store_id}/client_user`,
		method: 'DELETE',
		data: JSON.stringify({
			user_id
		}),
		contentType: 'application/json'
	});
};
