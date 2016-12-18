import $ from 'jquery'
import { url } from '../config'
import types from './manager/action_types.js';

export function fetchLocations(cityId){
	return function(dispatch){
		dispatch({
			type: types.LOCATION_GET,
			status: 'request',
			cityId
		});

		$.get( url.api_base_path + "manager/location", { 'city_id': cityId}, function(locations){
			dispatch({
				type: types.LOCATION_GET,
				status: 'success',
				locations: locations
			});
		});
		//TODO: Handle error
	};
};

export function fetchLocation(locationId){
	return function(dispatch){
		dispatch({
			type: types.LOCATION_ID_GET,
			status: 'request',
			locationId: locationId
		});

		$.get( url.api_base_path + `manager/location/${locationId}`, function(location){
			dispatch({
				type: types.LOCATION_ID_GET,
				status: 'success',
				location: location
			});
		});
		//TODO: Handle error
	};
};


export function loadLocationAddForm(){
	return function(dispatch){
		dispatch({
			type: types.LOCATION_FORM_LOAD,
			status: 'success'
		});
	};
};

export function loadLocationEditForm(locationId){
	return function(dispatch){
		dispatch({
			type: types.LOCATION_FORM_LOAD,
			status: 'request',
			locationId: locationId
		});
		dispatch(fetchLocation(locationId));
	};
};

export function saveLocationEditForm(location){
	return function(dispatch){
		dispatch({
			type: types.LOCATION_FORM_SUB,
			status: 'request'
		});
		dispatch({
			type: types.LOCATION_ID_POST,
			status: 'request',
			location: location
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + `manager/location/${location.id}`,
			data: JSON.stringify(location),
			contentType: "application/json"
		});
		req.done(function(savedLocation){
			dispatch({
				type: types.LOCATION_ID_POST,
				status: 'success',
				location: savedLocation
			});
			dispatch({
				type: types.LOCATION_FORM_SUB,
				status: 'success'
			});
		});
		req.fail(function(error){
			dispatch({
				type: types.LOCATION_ID_POST,
				status: 'error',
				errors: error.responseJSON
			});
			dispatch({
				type: types.LOCATION_FORM_SUB,
				status: 'error',
			});
		});
		return req;
	};
};

export function saveLocationAddForm(location){
	return function(dispatch){
		dispatch({
			type: types.LOCATION_FORM_SUB,
			status: 'request',
			location: location

		});
		dispatch({
			type: types.LOCATION_POST,
			status: 'request',
			location: location
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + "manager/location",
			data: JSON.stringify(location),
			contentType: "application/json"
		});
		req.done(function(savedLocation){
			dispatch({
				type: types.LOCATION_POST,
				status: 'success',
				location: savedLocation
			});
			dispatch({
				type: types.LOCATION_FORM_SUB,
				status: 'success',
			});
		});
		req.fail(function(error){
			dispatch({
				type: types.LOCATION_POST,
				status: 'error',
				errors: error.responseJSON
			});
			dispatch({
				type: types.LOCATION_FORM_SUB,
				status: 'error',
			});
		});
		return req;
	};
};

export function fetchStates(){
	return function(dispatch){
		dispatch({
			type: types.STATE_GET,
			status: 'request',
		});

		return $.get( url.api_base_path + "manager/state", function(states){
			dispatch({
				type: types.STATE_GET,
				status: 'success',
				states: states
			});
		});
		//TODO: Handle error
	};
};

export function fetchCities(stateCode){
	return function(dispatch){
		dispatch({
			type: types.CITY_GET,
			status: 'request',
			stateCode
		});

		return $.get( url.api_base_path + `manager/city/${stateCode}`, function(cities){
			dispatch({
				type: types.CITY_GET,
				status: 'success',
				stateCode,
				cities: cities
			});
		});
		//TODO: Handle error
	};
};

