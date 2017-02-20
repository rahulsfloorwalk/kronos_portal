import $ from 'jquery'
import { url } from '../../config.js'

export function fetchUser(){
	return $.get( url.api_base_path + `client/user`);
};

