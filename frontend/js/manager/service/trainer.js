import $ from "jquery";
import { url } from "../../../config.js";

export function findTrainers(){
	return $.get( url.api_base_path + "manager/trainer");
}

export function findById(trainerId){
	return $.get( url.api_base_path + `manager/trainer/${trainerId}`);
}

export function insert( email, password, is_active){
	return $.ajax({
		url: url.api_base_path + "manager/trainer",
		method: "POST",
		data: JSON.stringify({
			email,
			password,
			is_active
		}),
		contentType: "application/json"
	});
}

export function update(trainerId, email, password, is_active){
	return $.ajax({
		url: url.api_base_path + `manager/trainer/${trainerId}`,
		method: "POST",
		data: JSON.stringify({
			email,
			password,
			is_active
		}),
		contentType: "application/json"
	});
}
