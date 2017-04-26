import $ from 'jquery'
import { url } from '../../../config.js'

export function findModerators(){
	return $.get( url.api_base_path + `manager/moderator`);
};


export function findById(moderatorId){
	return $.get( url.api_base_path + `manager/moderator/${moderatorId}`);
};

export function insert( email, password, is_active){
	return $.ajax({
		url: url.api_base_path + `manager/moderator`,
		method: 'POST',
		data: JSON.stringify({
			email,
			password,
			is_active
		}),
		contentType: 'application/json'
	});
};

export function update(moderatorId, email, password, is_active){
	return $.ajax({
		url: url.api_base_path + `manager/moderator/${moderatorId}`,
		method: 'POST',
		data: JSON.stringify({
			email,
			password,
			is_active
		}),
		contentType: 'application/json'
	});
};
