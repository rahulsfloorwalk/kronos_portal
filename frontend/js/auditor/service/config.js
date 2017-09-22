
import $ from 'jquery'
import { url } from '../../../config.js'

let promise;
export function fetchConfig(){
	promise = promise || $.get( url.api_base_path + `auditor/config`);
	return promise;
};

