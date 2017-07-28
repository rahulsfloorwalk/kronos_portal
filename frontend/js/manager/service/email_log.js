import $ from 'jquery'
import { url } from '../../../config.js'

export function findEmailLogByEmail(toEmail){
	return $.get( url.api_base_path + `manager/email_log/${toEmail}`);
};

