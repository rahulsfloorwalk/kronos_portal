import $ from "jquery";
import { url } from "../../../config.js";

export function searchAuditors(search){
	return $.ajax( url.api_base_path + "manager/auditor",{
		data: {
			search
		},
	});
}

export function fetchAuditor(auditorId){
	return $.get( url.api_base_path + `manager/auditor/${auditorId}`);
}

export function fetchProfileInfoForAuditor(auditorId){
	return $.get( url.api_base_path + `manager/auditor/${auditorId}/profile_info`);
}

export function fetchBankInfoForAuditor(auditorId){
	return $.get( url.api_base_path + `manager/auditor/${auditorId}/bank_info`);
}

export function fetchAdditionalInfoForAuditor(auditorId){
	return $.get( url.api_base_path + `manager/auditor/${auditorId}/additional_info`);
}

export function fetchFacebookInfoForAuditor(auditorId){
	return $.get( url.api_base_path + `manager/auditor/${auditorId}/facebook_info`);
}

export function activateAuditor(userId){
	return $.post( url.api_base_path + `manager/auditor/${userId}/activate`);
}

export function deactivateAuditor(userId){
	return $.post( url.api_base_path + `manager/auditor/${userId}/deactivate`);
}

export function verifyAuditor(userId){
	return $.post( url.api_base_path + `manager/auditor/${userId}/verify`);
}

export function setEmail(userId, email){
	return $.post( url.api_base_path + `manager/auditor/${userId}/email`, {email});
}

export function setMobileNumber(userId, mobile_number){
	return $.post( url.api_base_path + `manager/auditor/${userId}/mobile_number`, {mobile_number});
}

export function sendPasswordResetEmail(userId){
	return $.post( url.api_base_path + `manager/auditor/${userId}/password_reset`);
}
