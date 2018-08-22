import $ from "jquery";
import { url } from "../../../config.js";

export function fetchClients(){
	return $.get( url.api_base_path + "manager/client");
}

export function fetchClient(clientId){
	return $.get( url.api_base_path + `manager/client/${clientId}`);
}

export function updateClient(client){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + `manager/client/${client.id}`,
		data: JSON.stringify(client),
		contentType: "application/json"
	});
}

export function addClient(client){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + "manager/client",
		data: JSON.stringify(client),
		contentType: "application/json"
	});
}
