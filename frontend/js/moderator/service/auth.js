import $ from 'jquery'
import { url } from '../../../config.js'

export function login(username, password){
	return $.ajax({
		url: url.api_base_path + `auth/moderator/login`,
		type: "POST",
		data: {
			username,
			password
		}
	});
};

export function logout(){
	return $.post(url.api_base_path + `auth/moderator/logout`);
};

