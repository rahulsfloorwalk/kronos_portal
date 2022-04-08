import $ from "jquery";
import { url } from "../../../config.js";

export function fetchCountries(){
	return $.get( url.api_base_path + "client_v1/country");
}

export function fetchStates(){
	return $.get( url.api_base_path + "client_v1/state");
}

export function fetchStatesByCountry(countryId){
	return $.get( url.api_base_path + `client_v1/${countryId}/state_by_country_id`);
}

export function fetchCities(stateCode){
	return $.get( url.api_base_path + `client_v1/city/${stateCode}`);
}

