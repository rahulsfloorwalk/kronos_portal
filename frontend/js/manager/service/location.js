import $ from "jquery";
import { url } from "../../../config.js";

export function fetchCountries(){
	return $.get( url.api_base_path + "manager/country");
}

export function fetchStates(){
	return $.get( url.api_base_path + "manager/state");
}

export function fetchStatesByCountry(countryId){
	return $.get( url.api_base_path + `manager/${countryId}/state_by_country_id`);
}

export function fetchCities(stateCode){
	return $.get( url.api_base_path + `manager/city/${stateCode}`);
}

