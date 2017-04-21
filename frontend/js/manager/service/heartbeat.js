import $ from 'jquery'
import { url } from '../../../config.js'

export function lubdub(){
	return $.get( url.api_base_path + `static/heartbeat.html`);
};

