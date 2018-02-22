import $ from 'jquery'
import { url } from '../../../config.js'

export function fetchCities(){
	return $.get( url.api_base_path + `client/city`);
};

