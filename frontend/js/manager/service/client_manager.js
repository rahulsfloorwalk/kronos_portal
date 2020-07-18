import $ from "jquery";
import { url } from "../../../config.js";


export function fetchClientManagers(clientId){
	return $.get(url.api_base_path + `manager/client/${clientId}/client_manager`);
}

export function addClientManager(clientManager){
	return $.ajax({
		type: "POST",
		url : url.api_base_path + "manager/client_manager",
		data: JSON.stringify(clientManager),
		contentType: "application/json"
	});
}

export function fetchClientManager(clientManagerId){
	return $.get(url.api_base_path + `manager/client_manager/${clientManagerId}`);
}

export function updateClientManager(clientManager){
	return $.ajax({
		type: "POST",
		url: url.api_base_path+ `manager/client_manager/${clientManager.id}`,
		data: JSON.stringify(clientManager),
		contentType: "application/json"
	});
}
