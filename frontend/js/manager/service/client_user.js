import $ from 'jquery'
import { url } from '../../../config.js'

export function fetchClientUsers(clientId){
	return $.get( url.api_base_path + `manager/client/${clientId}/client_user`);
};

export function fetchClientUser(clientUserId){
	return $.get( url.api_base_path + `manager/client_user/${clientUserId}`);
};

export function addClientUser(clientUser){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + "manager/client_user",
		data: JSON.stringify(clientUser),
		contentType: "application/json"
	});
};

export function updateClientUser(clientUser){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + `manager/client_user/${clientUser.id}`,
		data: JSON.stringify(clientUser),
		contentType: "application/json"
	});
};
