import $ from 'jquery'
import { url } from '../../../config.js'

export function fetchStates(){
	return $.get( url.api_base_path + "manager/state");
};

export function fetchCities(stateCode){
	return $.get( url.api_base_path + `manager/city/${stateCode}`);
};

export function fetchLocations(cityId){
	return $.get( url.api_base_path + "manager/location", { 'city_id': cityId});
};

export function fetchLocation(locationId){
	return $.get( url.api_base_path + `manager/location/${locationId}`);
};

export function addLocation(location){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + "manager/location",
		data: JSON.stringify(location),
		contentType: "application/json"
	});
};

export function updateLocation(location){
	return $.ajax({
		type: "POST",
		url: url.api_base_path + `manager/location/${location.id}`,
		data: JSON.stringify(location),
		contentType: "application/json"
	});
};

export function deleteLocation(locationId){
	return $.ajax({
		url: url.api_base_path + `manager/location/${locationId}`,
		type: "DELETE",
	});
};
