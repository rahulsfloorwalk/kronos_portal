import $ from 'jquery';
import { url } from '../../../config.js';
import types from '../action_types.js';
import { fetchStates as _fetchStates } from '../service/location.js';
import { fetchCities as _fetchCities } from '../service/location.js';
import { addLocation, updateLocation } from '../service/location.js';
import { deleteLocation as _deleteLocation } from '../service/location.js';
import { fetchLocations as _fetchLocations } from '../service/location.js';
import { fetchLocation as _fetchLocation } from '../service/location.js';

export function fetchLocations(cityId){
	return function(dispatch){
		dispatch({
			type: types.LOCATION_GET,
			status: 'request',
			cityId
		});

		return _fetchLocations(cityId).done(function(locations){
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

		return _fetchLocation(locationId).done(function(location){
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

		var req = updateLocation(location);
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

		var req = addLocation(location);
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


export function deleteLocation(locationId){
	return function(dispatch){
		dispatch({
			type: types.LOCATION_ID_DELETE,
			status: 'request',
			locationId: locationId
		});

		return _deleteLocation(locationId).done(function(){
			dispatch({
				type: types.LOCATION_ID_DELETE,
				status: 'success',
				locationId: locationId
			});
		});
		//TODO: Handle error
	};
};

export function fetchStates(){
	return function(dispatch){
		dispatch({
			type: types.STATE_GET,
			status: 'request',
		});

		return _fetchStates().done(function(states){
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

		return _fetchCities(stateCode).done(function(cities){
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

