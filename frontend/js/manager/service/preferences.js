import $ from "jquery";
import { url } from "../../../config.js";

export function fetchAuditorPreferences(userId){
	return $.get( url.api_base_path + `manager/auditor/${userId}/preferences`);
}

export function savePreferences(userId, preferences){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + `manager/auditor/${userId}/preferences`,
		data: JSON.stringify(preferences),
		contentType: "application/json"
	});
}

