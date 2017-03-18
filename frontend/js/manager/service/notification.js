import $ from 'jquery'
import { url } from '../../../config.js'

export function findNotifications(){
	return $.get( url.api_base_path + `manager/notifications`);
};

