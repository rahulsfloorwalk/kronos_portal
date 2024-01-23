import $ from "jquery";
import { url } from "../../../config.js";

export function findManagers(){
	return $.get( url.api_base_path + "manager/manager");
}


export function findManagerProfile(){
	return $.get( url.api_base_path + "manager/manager_profile");
}

export function findById(managerId){
	return $.get( url.api_base_path + `manager/manager/${managerId}`);
}


export function insert( email, password, is_active,name,mobile,is_admin){
	return $.ajax({
		url: url.api_base_path + "manager/manager",
		method: "POST",
		data: JSON.stringify({
			email,
			password,
			is_active,
			name,
			mobile,
			is_admin
		}),
		contentType: "application/json"
	});
}

export function update(managerId, email, password, is_active,name,mobile,is_admin){
	return $.ajax({
		url: url.api_base_path + `manager/manager/${managerId}`,
		method: "POST",
		data: JSON.stringify({
			email,
			password,
			is_active,
			name,
			mobile,
			is_admin
		}),
		contentType: "application/json"
	});
}
