import $ from "jquery";
import { url } from "../../../config.js";


export function fetchClientTrainers(clientId){
	return $.get(url.api_base_path + `manager/client/${clientId}/client_trainer`);
}

export function fetchClientDetails(auditCycleId){
	return $.get(url.api_base_path + `manager/audit_cycle/${auditCycleId}/client_details`);
}

export function addClientTrainer(clientTrainer){
	return $.ajax({
		type: "POST",
		url : url.api_base_path + "manager/client_trainer",
		data: JSON.stringify(clientTrainer),
		contentType: "application/json"
	});
}

export function fetchClientTrainer(clientTrainerId){
	return $.get(url.api_base_path + `manager/client_trainer/${clientTrainerId}`);
}

export function updateClientTrainer(clientTrainer){
	return $.ajax({
		type: "POST",
		url: url.api_base_path+ `manager/client_trainer/${clientTrainer.id}`,
		data: JSON.stringify(clientTrainer),
		contentType: "application/json"
	});
}
