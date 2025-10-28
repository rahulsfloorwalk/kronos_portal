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

export function findEligibileAuditorByPresenceInCityId(auditCycleId,storeId){
	return $.get( url.api_base_path + `manager/audit_cycle/${auditCycleId}/store/${storeId}/eligibility_wise_auditors`);
}

export function findDistanceAuditorByPresenceInStoreId(storeId){
	return $.get( url.api_base_path + `manager/store/${storeId}/distance_wise_auditors`);
}

