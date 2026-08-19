import $ from "jquery";
import { url } from "../../../config.js";


export function fetchClientManagers(clientId){
	return $.get(url.api_base_path + `manager/client/${clientId}/client_manager`);
}

export function fetchClientModerators(clientId){
	return $.get(url.api_base_path + `manager/client/${clientId}/client_moderator`);
}

export function fetchClientModeratorToCheck(clientId){
	return $.get(url.api_base_path + `manager/client/${clientId}/client_moderator_assign`);
}

export function fetchClientModeratorEdit(clientQaId){
	return $.get(url.api_base_path + `manager/client_moderator/${clientQaId}`);
}

export function fetchClientDashboardVisibility(clientId){
	return $.get(url.api_base_path + `manager/client/${clientId}/dashboard_widget_visibility_access`);
}

export function addClientManager(clientManager){
	return $.ajax({
		type: "POST",
		url : url.api_base_path + "manager/client_manager",
		data: JSON.stringify(clientManager),
		contentType: "application/json"
	});
}

export function addClientModerator(clientModerator){
	return $.ajax({
		type: "POST",
		url : url.api_base_path + "manager/client_moderator_insert",
		data: JSON.stringify(clientModerator),
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

export function updateClientModerator(clientModerator){
	return $.ajax({
		type: "POST",
		url: url.api_base_path+ `manager/client_moderator/${clientModerator.id}`,
		data: JSON.stringify(clientModerator),
		contentType: "application/json"
	});
}

export function updateClientDashboardVisibility(clientId, payload){
	return $.ajax({
		type: "POST",
		url: url.api_base_path+ `manager/client/${clientId}/dashboard_widget_visibility_access`,
		data: JSON.stringify(payload),
		contentType: "application/json"
	});
}