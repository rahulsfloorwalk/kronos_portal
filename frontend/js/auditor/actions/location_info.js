import $ from "jquery";
import { url } from "../../../config";
import types from "../action_types.js";

export function fetchCountries(){
	return function(dispatch){
		dispatch({
			type: types.COUNTRY_GET,
			status: "request",
		});

		return $.get( url.api_base_path + "auditor/country", function(countries){
			dispatch({
				type: types.COUNTRY_GET,
				status: "success",
				countries: countries
			});
		});
		//TODO: Handle error
	};
}


export function fetchStates(){
	return function(dispatch){
		dispatch({
			type: types.STATE_GET,
			status: "request",
		});

		return $.get( url.api_base_path + "auditor/state", function(states){
			dispatch({
				type: types.STATE_GET,
				status: "success",
				states: states
			});
		});
		//TODO: Handle error
	};
}


export function fetchStatesByCountry(countryCode){
	return function(dispatch){
		dispatch({
			type: types.STATE_GET_BY_COUNTRY,
			status: "request",
		});

		return $.get( url.api_base_path + `auditor/state/${countryCode}`, function(states){
			dispatch({
				type: types.STATE_GET_BY_COUNTRY,
				status: "success",
				country_states: states
			});
		});
		//TODO: Handle error
	};
}

export function fetchCities(stateCode){
	return function(dispatch){
		dispatch({
			type: types.CITY_GET,
			status: "request",
			stateCode
		});

		return $.get( url.api_base_path + `auditor/city/${stateCode}`, function(cities){
			dispatch({
				type: types.CITY_GET,
				status: "success",
				stateCode,
				cities: cities
			});
		});
		//TODO: Handle error
	};
}
