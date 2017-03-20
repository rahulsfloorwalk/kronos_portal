import $ from 'jquery'
import { url } from '../../../config.js'

export function findNotifications(data){
	return $.get( url.api_base_path + `manager/notifications`, data);
};

