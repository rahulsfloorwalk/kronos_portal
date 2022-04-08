import $ from "jquery";
import { url } from "../../../config.js";

export function fetchClientUsers(clientId){
	return $.get( url.api_base_path + `client_v1/${clientId}/client_user`);
}

export function fetchClientUser(clientUserId){
	return $.get( url.api_base_path + `client_v1/client_user/${clientUserId}`);
}

export function addClientUser(clientUser){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + "client_v1/client_user",
		data: JSON.stringify(clientUser),
		contentType: "application/json"
	});
}

export function updateClientUser(clientUser){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + `client_v1/client_user/${clientUser.id}`,
		data: JSON.stringify(clientUser),
		contentType: "application/json"
	});
}

export function assignStoreToClientUser(store_id, user_id){
	return $.ajax({
		url: url.api_base_path + `client_v1/store/${store_id}/client_user`,
		method: "POST",
		data: JSON.stringify({
			user_id
		}),
		contentType: "application/json"
	});
}

export function revokeStoreFromClientUser(store_id, user_id){
	return $.ajax({
		url: url.api_base_path + `client_v1/store/${store_id}/client_user`,
		method: "DELETE",
		data: JSON.stringify({
			user_id
		}),
		contentType: "application/json"
	});
}

export function fetchClientUsersForStore(store_id){
	return $.get(url.api_base_path + `client_v1/store/${store_id}/client_user`);
}

export function getAssignStoresForNonAdminUser(user_id){
	return $.get(url.api_base_path + `client_v1/client_user/${user_id}/assign_stores`);
}

export function assignStoresForNonAdminUser(user_id, store_list){
	return $.ajax({
		url: url.api_base_path + `client_v1/client_user/${user_id}/assign_stores`,
		method: "POST",
		data: JSON.stringify({
			"stores_list": store_list
		}),
		contentType: "application/json"
	});
}
