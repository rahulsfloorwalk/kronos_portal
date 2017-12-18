import $ from 'jquery'
import { url } from '../../../config.js'

export function fetchStates(){
	return $.get( url.api_base_path + "manager/state");
};

export function fetchCities(stateCode){
	return $.get( url.api_base_path + `manager/city/${stateCode}`);
};

