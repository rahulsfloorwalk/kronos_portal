import $ from "jquery";
import { url } from "../../../config";
import { hashHistory } from "react-router";
import types from "../action_types.js";

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
