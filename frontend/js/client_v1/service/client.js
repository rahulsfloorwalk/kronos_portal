import $ from "jquery";
import { url } from "../../../config.js";

export function fetchClient(){
	return $.get( url.api_base_path + "client_v1/client");
}

export function updateClient(client){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + `client_v1/client/${client.id}`,
		data: JSON.stringify(client),
		contentType: "application/json"
	});
}

export function fetchClientBankInfo(clientId){
	return $.get( url.api_base_path + `client_v1/client/${clientId}/bank_info`);
}

export function updateClientBankInfo(clientId, bankInfo){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + `client_v1/client/${clientId}/bank_info`,
		data: JSON.stringify(bankInfo),
		contentType: "application/json"
	});
}

export function fetchAccountBalance(){
	return $.get( url.api_base_path + "client_v1/client/account_balance");
}