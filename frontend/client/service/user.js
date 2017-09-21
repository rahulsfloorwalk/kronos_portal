import $ from 'jquery'
import { url } from '../../config.js'

let promise;
export function fetchUser(){
	promise = promise || $.get( url.api_base_path + `client/user`);
	return promise;
};

