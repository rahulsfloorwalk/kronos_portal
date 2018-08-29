import $ from "jquery";
import { url } from "../../../config.js";

export function searchAgencyUsers(search){
	return $.ajax( url.api_base_path + "manager/agency_user",{
		data: {
			search
		},
	});
}

export function fetchAgencyUser(userId){
	return $.get( url.api_base_path + `manager/agency_user/${userId}`);
}

export function fetchAgencyPresence(userId){
	return $.get( url.api_base_path + `manager/agency_user/${userId}/presence`);
}

export function findAgencyUserByPresenceInCityId(cityId){
	return $.get( url.api_base_path + `manager/agency_user/city_id/${cityId}`);
}

