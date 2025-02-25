import $ from "jquery";
import { url } from "../../../config.js";

export function getProfileCompletionPercentage(){
	return $.get(url.api_base_path + "auditor/profile_completion_percentage");
}

export function gettoken(user_id){
	return $.ajax({
		url: url.api_base_path + "auditor/get_token",
		method: "POST",
		data: JSON.stringify({
			user_id
		}),
		contentType: "application/json"
	});
}