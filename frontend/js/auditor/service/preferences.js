import $ from 'jquery'
import { url } from '../../../config.js'

export function fetchPreferences(){
	return $.get( url.api_base_path + `auditor/preferences`);
};

export function savePreferences(preferences){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + "auditor/preferences",
		data: JSON.stringify(preferences),
		contentType: "application/json"
	});
};

