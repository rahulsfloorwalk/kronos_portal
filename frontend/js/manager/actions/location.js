import $ from "jquery";
import { url } from "../../../config.js";
import types from "../action_types.js";
import { fetchStates as _fetchStates } from "../service/location.js";
import { fetchCities as _fetchCities } from "../service/location.js";

export function fetchStates(){
	return function(dispatch){
		dispatch({
			type: types.STATE_GET,
			status: "request",
		});

		return _fetchStates().done(function(states){
			dispatch({
				type: types.STATE_GET,
				status: "success",
				states: states
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

		return _fetchCities(stateCode).done(function(cities){
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

